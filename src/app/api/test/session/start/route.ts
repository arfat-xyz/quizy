import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const loginUser = await auth();
    if (loginUser?.user?.role !== Role.TEST) {
      return formatErrorResponse("You're not authorized for this", 401);
    }
    const body = await request.json();
    const { testId } = body;

    if (!testId) {
      return formatErrorResponse("Test ID is required", 400);
    }

    // Verify test exists and user is assigned
    const test = await db.test.findUnique({
      where: {
        id: testId,
        assignedTests: {
          some: {
            userId: loginUser?.user?.id,
          },
        },
      },
    });

    if (!test) {
      return formatErrorResponse("Test not found or not assigned to user", 404);
    }

    // Check if test is available today
    const today = new Date();
    const testDate = new Date(test.date);

    today.setHours(0, 0, 0, 0);
    testDate.setHours(0, 0, 0, 0);

    if (testDate.getTime() !== today.getTime()) {
      return formatErrorResponse("Test is not available today", 400);
    }

    // Check if session already exists with userId and testId
    const existingSession = await db.userTestSession.findFirst({
      where: {
        userId: loginUser?.user?.id,
        testId: testId,
        submitted: false, // Only return non-submitted sessions
      },
    });

    // If session already exists, return it
    if (existingSession) {
      return formatResponse(
        { sessionId: existingSession.id },
        "Existing test session found",
      );
    }

    // Create a new test session
    const session = await db.userTestSession.create({
      data: {
        userId: loginUser?.user?.id,
        testId: testId,
        startedAt: new Date(),
        submitted: false,
        totalScore: 0,
      },
    });

    return formatResponse(
      { sessionId: session.id },
      "Test session started successfully",
    );
  } catch (error) {
    console.error("Error starting test session:", error);
    return routeErrorHandler(error);
  }
}
