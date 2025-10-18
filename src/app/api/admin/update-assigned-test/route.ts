import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { generateDecisionEmail } from "@/lib/email-template-generator";
import { sendEmailViaNodemailer } from "@/lib/mail";
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
    const { userId, testId, status } = body;

    if (!userId || !testId || !status) {
      return formatErrorResponse(
        "User ID, Test ID, and status are required",
        400,
      );
    }

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return formatErrorResponse(
        "Invalid status. Must be 'accepted', 'rejected', or 'pending'",
        400,
      );
    }

    // Fetch user and test details for email
    const [user, test] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          userName: true,
        },
      }),
      db.test.findUnique({
        where: { id: testId },
        include: {
          position: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    if (!user || !test) {
      return formatErrorResponse("User or test not found", 404);
    }

    // Update the assigned test status using composite unique key
    const updatedAssignedTest = await db.assignedTest.update({
      where: {
        userId_testId: {
          userId: userId,
          testId: testId,
        },
      },
      data: {
        status: status,
      },
    });

    // Send email notification to the candidate
    try {
      const decisionEmail = generateDecisionEmail(
        user.name || user.userName || "Candidate",
        test.name,
        test.position.name,
        status,
        authData.user?.name || "Administrator",
      );

      await sendEmailViaNodemailer({
        template: decisionEmail,
        subject: `Test Result Update: ${test.name}`,
        to: user.email as string,
      });

      console.log(`Decision notification email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send decision email:", emailError);
      // Don't fail the main request if email fails
    }

    return formatResponse(updatedAssignedTest, "Decision updated successfully");
  } catch (error) {
    console.error("Error updating assigned test:", error);

    return routeErrorHandler(error);
  }
}
