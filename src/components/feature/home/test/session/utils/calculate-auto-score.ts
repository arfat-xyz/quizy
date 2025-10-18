import { db } from "@/lib/db";

// Helper function to calculate auto score for MCQ questions
export async function calculateAutoScore(sessionId: string): Promise<number> {
  const userAnswers = await db.userAnswer.findMany({
    where: { testSessionId: sessionId },
    include: {
      question: {
        include: {
          choices: true,
        },
      },
    },
  });

  let totalScore = 0;

  for (const userAnswer of userAnswers) {
    if (userAnswer.question.type === "MCQ" && userAnswer.autoScore === null) {
      const userResponse = userAnswer.response.split(",").map(Number);
      const correctAnswers = userAnswer.question.correct;

      // Check if all correct answers are selected and no incorrect ones
      const isCorrect =
        correctAnswers.length === userResponse.length &&
        correctAnswers.every(answer => userResponse.includes(answer));

      const score = isCorrect ? userAnswer.question.score : 0;

      // Update the autoScore
      await db.userAnswer.update({
        where: { id: userAnswer.id },
        data: { autoScore: score },
      });

      totalScore += score;
    } else if (userAnswer.autoScore !== null) {
      totalScore += userAnswer.autoScore;
    }
  }

  return totalScore;
}
