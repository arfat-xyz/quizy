import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateWelcomeEmail } from "@/lib/email-template-generator";
import { sendEmailViaNodemailer } from "@/lib/mail";
import { CreateTraineeSchema } from "@/zod-schemas/admin/trainee/CreateTraineeSchema";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const loginUser = await auth();
    if (loginUser?.user?.role !== Role.ADMIN)
      return formatErrorResponse("You're not authorized for this", 401);
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateTraineeSchema.parse(body);
    const { username, name, email, password } = validatedData;
    const lowerCaseEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: lowerCaseEmail },
    });

    if (existingUser) {
      return formatErrorResponse("User with this email already exists", 400);
    }

    // Check if username is taken
    const existingUsername = await db.user.findFirst({
      where: { userName: username },
    });

    if (existingUsername) {
      return formatErrorResponse("Username is already taken", 400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with emailVerified set to true
    const user = await db.user.create({
      data: {
        userName: username,
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Set emailVerified to current timestamp
        role: Role.TEST, // Default role as per your model
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // Send welcome email
    const welcomeEmail = generateWelcomeEmail(username, lowerCaseEmail);
    await sendEmailViaNodemailer({
      template: welcomeEmail,
      subject: "Welcome to Our Platform!",
      to: lowerCaseEmail,
    });
    return formatResponse(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
        },
      },
      "Registration successful",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return routeErrorHandler(error);
  }
}
