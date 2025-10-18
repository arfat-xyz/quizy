import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { answerId, score } = body;

    if (!answerId || score === undefined) {
      return formatErrorResponse("Answer ID and score are required", 400);
    }

    // Update the answer score
    const updatedAnswer = await db.userAnswer.update({
      where: { id: answerId },
      data: {
        givenScore: Number(score),
        // Note: If you want to store notes, you'll need to add a note field to UserAnswer model
      },
      include: {
        testSession: {
          include: {
            userAnswers: true,
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
