import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { generateTestAssignmentEmail } from "@/lib/email-template-generator";
import { sendEmailViaNodemailerMany } from "@/lib/mail";
import { TestFormSchema } from "@/zod-schemas";
import { AssignedTest, User } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = TestFormSchema.parse(body);

    // Check if position exists
    const positionExists = await db.position.findUnique({
      where: { id: validatedData.positionId },
    });

    if (!positionExists) {
      return formatErrorResponse("Position not found", 404);
    }

    // Check if all groups exist
    const groupsExist = await db.group.findMany({
      where: {
        id: { in: validatedData.testGroups },
      },
    });

    if (groupsExist.length !== validatedData.testGroups.length) {
      return formatErrorResponse("One or more groups not found", 404);
    }

    // Check if assigned users exist and get their details for email
    let assignedUsers: Pick<User, "id" | "name" | "userName" | "email">[] = [];
    if (validatedData.assignedUsers && validatedData.assignedUsers.length > 0) {
      assignedUsers = await db.user.findMany({
        where: {
          id: { in: validatedData.assignedUsers },
        },
        select: {
          id: true,
          name: true,
          userName: true,
          email: true,
        },
      });

      if (assignedUsers.length !== validatedData.assignedUsers.length) {
        return formatErrorResponse("One or more assigned users not found", 404);
      }
    }

    // Create test with transaction
    const result = await db.$transaction(async tx => {
      // Create the test
      const test = await tx.test.create({
        data: {
          name: validatedData.name,
          positionId: validatedData.positionId,
          date: new Date(validatedData.date),
          durationMin: validatedData.durationMin,
        },
      });

      // Create test groups
      const testGroups = await Promise.all(
        validatedData.testGroups.map(groupId =>
          tx.testGroup.create({
            data: {
              testId: test.id,
              groupId: groupId,
            },
          }),
        ),
      );

      // Assign test to users if provided
      let assignedTests: AssignedTest[] = [];
      if (assignedUsers.length > 0) {
        assignedTests = await Promise.all(
          assignedUsers.map(user =>
            tx.assignedTest.create({
              data: {
                userId: user.id,
                testId: test.id,
              },
            }),
          ),
        );
      }

      return {
        test,
        testGroups,
        assignedTests,
        assignedUsers, // Include user details for email
      };
    });

    // Send emails to assigned users asynchronously (don't await to avoid blocking response)
    if (result.assignedUsers && result.assignedUsers.length > 0) {
      sendAssignmentEmails(
        result.assignedUsers,
        result.test,
        positionExists.name,
      ).catch(error => {
        console.error("Failed to send assignment emails:", error);
        // Don't throw error here to avoid failing the main request
      });
    }

    return formatResponse(
      {
        test: result.test,
        testGroups: result.testGroups,
        assignedTests: result.assignedTests,
        emailSent: result.assignedUsers?.length > 0,
      },
      "Test created successfully",
    );
  } catch (error) {
    console.log("Error creating test:", { error });
    return routeErrorHandler(error);
  }
}

// Helper function to send assignment emails using bulk email
async function sendAssignmentEmails(
  users: Pick<User, "id" | "name" | "userName" | "email">[],
  test: { id: string; name: string; date: Date; durationMin: number },
  positionName: string,
) {
  try {
    // Extract email addresses
    const emailAddresses = users.map(user => user.email);

    // Generate personalized email content for the first user (or use a generic template)
    // Since we're using bulk email, we'll create a generic template that works for all users
    const assignmentEmail = generateTestAssignmentEmail(
      "Test Taker", // Generic name since we're sending bulk
      "", // No specific email needed for generic template
      test.name,
      positionName,
      test.date,
      test.durationMin,
      test.id,
    );

    await sendEmailViaNodemailerMany({
      template: assignmentEmail,
      subject: `New Test Assigned: ${test.name}`,
      to: emailAddresses as string[],
    });

    console.log(`Assignment emails sent to ${emailAddresses.length} users`);
  } catch (error) {
    console.error("Failed to send bulk assignment emails:", error);
    throw error;
  }
}
