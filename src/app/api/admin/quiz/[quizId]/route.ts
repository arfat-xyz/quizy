import { formatErrorResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("Unauthorized", 401);
    }
    const { quizId } = await params;

    // First, check if the quiz exists
    const existingQuiz = await db.question.findUnique({
      where: { id: quizId },
      include: {
        userAnswers: true,
        testQuestions: true,
        choices: true,
      },
    });

    if (!existingQuiz) {
      return NextResponse.json(
        { message: "Quiz question not found" },
        { status: 404 },
      );
    }

    // Perform cascade deletion in transaction
    const result = await db.$transaction(async tx => {
      // 1. Delete all user answers for this question
      await tx.userAnswer.deleteMany({
        where: { questionId: quizId },
      });

      // 2. Delete all test question references
      await tx.testQuestion.deleteMany({
        where: { questionId: quizId },
      });

      // 3. Delete all choices for this question
      await tx.choice.deleteMany({
        where: { questionId: quizId },
      });

      // 4. Finally delete the question itself
      const deletedQuestion = await tx.question.delete({
        where: { id: quizId },
      });

      return deletedQuestion;
    });

    return NextResponse.json({
      message: "Quiz question and all related data deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
