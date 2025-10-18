import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, questionId, response } = body;
    if (!sessionId || !questionId) {
      return formatErrorResponse(
        "Session ID and Question ID are required",
        400,
      );
    }

    // Check if session exists and is not submitted
    const session = await db.userTestSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.submitted) {
      return formatErrorResponse(
        "Invalid session or test already submitted",
        400,
      );
    }

    // Check if answer already exists
    const existingAnswer = await db.userAnswer.findFirst({
      where: {
        testSessionId: sessionId,
        questionId: questionId,
      },
    });

    let userAnswer;

    if (existingAnswer) {
      // Update existing answer
      userAnswer = await db.userAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          response: response,
        },
      });
    } else {
      // Create new answer
      userAnswer = await db.userAnswer.create({
        data: {
          testSessionId: sessionId,
          questionId: questionId,
          response: response,
        },
      });
    }

    return formatResponse(userAnswer, "Answer saved successfully");
  } catch (error) {
    console.error("Error saving answer:", error);
    return routeErrorHandler(error);
  }
}
