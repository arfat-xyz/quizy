import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Zod schema for validation
const EvaluateAnswersSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  scores: z
    .array(
      z.object({
        answerId: z.string().min(1, "Answer ID is required"),
        score: z.number().min(0, "Score must be a non-negative number"),
        // Note is optional since we removed it from the UI
        note: z.string().optional(),
      }),
    )
    .min(1, "At least one score is required"),
});

export async function POST(request: Request) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    // Validate request body
    const validatedData = EvaluateAnswersSchema.parse(body);
    const { sessionId, scores } = validatedData;

    // Verify session exists and is submitted
    const session = await db.userTestSession.findUnique({
      where: {
        id: sessionId,
        submitted: true,
      },
    });

    if (!session) {
      return formatErrorResponse("Session not found or not submitted", 404);
    }

    // Validate that all answer IDs belong to the session
    const answerIds = scores.map(score => score.answerId);
    const existingAnswers = await db.userAnswer.findMany({
      where: {
        id: { in: answerIds },
        testSessionId: sessionId,
      },
      include: {
        question: true,
      },
    });

    if (existingAnswers.length !== scores.length) {
      return formatErrorResponse(
        "One or more answers not found in this session",
        400,
      );
    }

    // Validate score limits for each answer
    for (const scoreData of scores) {
      const answer = existingAnswers.find(a => a.id === scoreData.answerId);
      if (answer && scoreData.score > answer.question.score) {
        return formatErrorResponse(
          `Score for answer ${scoreData.answerId} exceeds maximum allowed (${answer.question.score})`,
          400,
        );
      }
    }

    // Update scores for all text answers
    const updatePromises = scores.map(({ answerId, score }) =>
      db.userAnswer.update({
        where: { id: answerId },
        data: {
          givenScore: Number(score),
        },
      }),
    );

    await Promise.all(updatePromises);

    // Recalculate total score
    const sessionWithAnswers = await db.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        userAnswers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (sessionWithAnswers) {
      const totalScore = sessionWithAnswers.userAnswers.reduce(
        (sum, answer) => {
          if (answer.question.type === "MCQ") {
            return sum + (answer.autoScore || 0);
          } else {
            return sum + (answer.givenScore || 0);
          }
        },
        0,
      );

      await db.userTestSession.update({
        where: { id: sessionId },
        data: { totalScore },
      });
    }

    return formatResponse({}, "All scores updated successfully");
  } catch (error) {
    console.error("Error evaluating answers:", error);

    return routeErrorHandler(error);
  }
}
