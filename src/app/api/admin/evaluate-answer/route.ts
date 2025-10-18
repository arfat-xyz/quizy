import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Zod schema for single answer validation
const EvaluateAnswerSchema = z.object({
  answerId: z.string().min(1, "Answer ID is required"),
  score: z.number().min(0, "Score must be a non-negative number"),
  note: z.string().optional(),
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
    const validatedData = EvaluateAnswerSchema.parse(body);
    const { answerId, score } = validatedData;

    // Verify answer exists and belongs to a submitted session
    const answer = await db.userAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        testSession: true,
      },
    });

    if (!answer) {
      return formatErrorResponse("Answer not found", 404);
    }

    if (!answer.testSession.submitted) {
      return formatErrorResponse(
        "Cannot evaluate answers for unsubmitted sessions",
        400,
      );
    }

    // Validate score limit
    if (score > answer.question.score) {
      return formatErrorResponse(
        `Score exceeds maximum allowed (${answer.question.score})`,
        400,
      );
    }

    // Update the answer score
    const updatedAnswer = await db.userAnswer.update({
      where: { id: answerId },
      data: {
        givenScore: Number(score),
      },
      include: {
        testSession: {
          include: {
            userAnswers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    // Recalculate total score for the session
    const sessionWithAnswers = await db.userTestSession.findUnique({
      where: { id: updatedAnswer.testSessionId },
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
        where: { id: updatedAnswer.testSessionId },
        data: { totalScore },
      });
    }

    return formatResponse(updatedAnswer, "Score updated successfully");
  } catch (error) {
    console.error("Error evaluating answer:", error);

    return routeErrorHandler(error);
  }
}
