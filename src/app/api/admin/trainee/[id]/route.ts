import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { z } from "zod";

// Zod schema for validation
const DeleteTraineeSchema = z.object({
  id: z.string().min(1, "Trainee ID is required"),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("You're not authorized for this action", 401);
    }

    const { id } = await params;

    // Validate trainee ID
    const validatedData = DeleteTraineeSchema.parse({ id });

    // Check if trainee exists and is actually a trainee (TEST role)
    const trainee = await db.user.findUnique({
      where: {
        id: validatedData.id,
        role: Role.TEST,
      },
      include: {
        accounts: true,
        sessions: true,
        authenticators: true,
        AssignedTest: true,
        UserTestSession: {
          include: {
            userAnswers: true,
          },
        },
      },
    });

    if (!trainee) {
      return formatErrorResponse("Trainee not found", 404);
    }

    // Use a transaction to ensure all operations succeed or fail together
    await db.$transaction(async tx => {
      // 1. Delete user answers associated with test sessions
      if (trainee.UserTestSession.length > 0) {
        const userAnswerIds = trainee.UserTestSession.flatMap(session =>
          session.userAnswers.map(answer => answer.id),
        );

        if (userAnswerIds.length > 0) {
          await tx.userAnswer.deleteMany({
            where: {
              id: {
                in: userAnswerIds,
              },
            },
          });
        }
      }

      // 2. Delete user test sessions
      if (trainee.UserTestSession.length > 0) {
        await tx.userTestSession.deleteMany({
          where: {
            userId: validatedData.id,
          },
        });
      }

      // 3. Delete assigned tests
      if (trainee.AssignedTest.length > 0) {
        await tx.assignedTest.deleteMany({
          where: {
            userId: validatedData.id,
          },
        });
      }

      // 4. Delete authentication related data
      if (trainee.authenticators.length > 0) {
        await tx.authenticator.deleteMany({
          where: {
            userId: validatedData.id,
          },
        });
      }

      // 5. Delete sessions
      if (trainee.sessions.length > 0) {
        await tx.session.deleteMany({
          where: {
            userId: validatedData.id,
          },
        });
      }

      // 6. Delete accounts (OAuth connections)
      if (trainee.accounts.length > 0) {
        await tx.account.deleteMany({
          where: {
            userId: validatedData.id,
          },
        });
      }

      // 7. Delete any password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: {
          email: trainee.email || "",
        },
      });

      // 8. Delete any verification tokens
      await tx.verificationToken.deleteMany({
        where: {
          email: trainee.email || "",
        },
      });

      // 9. Finally delete the user
      const deletedUser = await tx.user.delete({
        where: { id: validatedData.id },
      });

      return deletedUser;
    });

    return formatResponse(
      { traineeId: validatedData.id },
      "Trainee and all associated data deleted successfully",
    );
  } catch (error) {
    console.error("Error deleting trainee:", error);

    return routeErrorHandler(error);
  }
}
