import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { testId: string } },
) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("You're not authorized for this action", 401);
    }

    const testId = params.testId;

    // First, check if the test exists
    const existingTest = await db.test.findUnique({
      where: { id: testId },
      include: {
        assignedTests: true,
        testSessions: {
          include: {
            userAnswers: true,
          },
        },
        testGroups: true,
        TestQuestion: true,
      },
    });

    if (!existingTest) {
      return formatErrorResponse("Test not found", 404);
    }

    // Perform cascade deletion in transaction
    const result = await db.$transaction(async tx => {
      // 1. Delete all user answers from test sessions
      for (const session of existingTest.testSessions) {
        await tx.userAnswer.deleteMany({
          where: { testSessionId: session.id },
        });
      }

      // 2. Delete all test sessions
      await tx.userTestSession.deleteMany({
        where: { testId: testId },
      });

      // 3. Delete all assigned tests
      await tx.assignedTest.deleteMany({
        where: { testId: testId },
      });

      // 4. Delete all test question references
      await tx.testQuestion.deleteMany({
        where: { testId: testId },
      });

      // 5. Delete all test groups
      await tx.testGroup.deleteMany({
        where: { testId: testId },
      });

      // 6. Finally delete the test itself
      const deletedTest = await tx.test.delete({
        where: { id: testId },
      });

      return deletedTest;
    });

    return formatResponse({
      message: "Test and all related data deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting test:", error);

    return routeErrorHandler(error);
  }
}
