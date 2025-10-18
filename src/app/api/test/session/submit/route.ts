import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, autoSubmit = false } = body;

    if (!sessionId) {
      return formatErrorResponse("Session ID is required", 400);
    }

    // Check if session exists
    const session = await db.userTestSession.findUnique({
      where: { id: sessionId },
      include: {
        userAnswers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      return formatErrorResponse("Session not found", 404);
    }

    if (session.submitted) {
      return formatErrorResponse("Test already submitted", 400);
    }

    // Calculate auto scores for MCQ questions
    let totalScore = 0;

    for (const userAnswer of session.userAnswers) {
      if (userAnswer.question.type === "MCQ" && userAnswer.autoScore === null) {
        const userResponse = userAnswer.response.split(",").map(Number);
        const correctAnswers = userAnswer.question.correct;

        const isCorrect =
          correctAnswers.length === userResponse.length &&
          correctAnswers.every(answer => userResponse.includes(answer));

        const score = isCorrect ? userAnswer.question.score : 0;

        await db.userAnswer.update({
          where: { id: userAnswer.id },
          data: { autoScore: score },
        });

        totalScore += score;
      } else if (userAnswer.autoScore !== null) {
        totalScore += userAnswer.autoScore;
      }
    }

    // Update session as submitted
    const updatedSession = await db.userTestSession.update({
      where: { id: sessionId },
      data: {
        submitted: true,
        endedAt: new Date(),
        totalScore: totalScore,
      },
    });
    console.log("updatedSession", updatedSession);
    return formatResponse(
      { sessionId: updatedSession.id, totalScore },
      autoSubmit
        ? "Test auto-submitted successfully"
        : "Test submitted successfully",
    );
  } catch (error) {
    console.error("Error submitting test:", error);
    return routeErrorHandler(error);
  }
}
