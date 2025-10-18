import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateWelcomeEmail } from "@/lib/email-template-generator";
import { sendEmailViaNodemailer } from "@/lib/mail";
import { Role } from "@prisma/client";
import { z } from "zod";

// Zod schema for validation
const SendTraineeEmailSchema = z.object({
  traineeId: z.string().min(1, "Trainee ID is required"),
  email: z.string().email("Invalid email address"),
  traineeName: z.string().min(1, "Trainee name is required"),
});

export async function POST(request: Request) {
  try {
    const authData = await auth();

    // Check if user is admin
    if (authData?.user?.role !== Role.ADMIN) {
      return formatErrorResponse("You're not authorized for this action", 401);
    }

    const body = await request.json();

    // Validate request body
    const validatedData = SendTraineeEmailSchema.parse(body);
    const { traineeId, email, traineeName } = validatedData;

    // Verify trainee exists and is actually a trainee
    const trainee = await db.user.findUnique({
      where: {
        id: traineeId,
        email: email.toLowerCase(),
        role: Role.TEST,
      },
    });

    if (!trainee) {
      return formatErrorResponse("Trainee not found", 404);
    }

    // Send welcome email
    const welcomeEmail = generateWelcomeEmail(traineeName, email.toLowerCase());

    await sendEmailViaNodemailer({
      template: welcomeEmail,
      subject: "Welcome to Our Platform!",
      to: email.toLowerCase(),
    });

    return formatResponse(
      {
        traineeId,
        emailSent: true,
      },
      "Welcome email sent successfully",
    );
  } catch (error) {
    console.error("Error sending trainee email:", error);

    return routeErrorHandler(error);
  }
}
