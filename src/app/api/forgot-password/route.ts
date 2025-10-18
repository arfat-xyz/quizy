import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/token";
import { sendEmailViaNodemailer } from "@/lib/mail";
import { env } from "@/lib/envs";
import { generatePasswordResetEmail } from "@/lib/email-template-generator";
import { ForgotPasswordSchema } from "@/zod-schemas/auth/forget-password";
import { getAccountByUserId } from "@/data/account";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);

    const { email } = validatedData;
    const lowerCaseEmail = email.toLowerCase();

    // Check if user exists
    const user = await db.user.findFirst({
      where: {
        email: lowerCaseEmail,
      },
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return formatResponse(
        null,
        "If an account with that email exists, we've sent a password reset link.",
        200,
      );
    }

    const existingAccount = await getAccountByUserId(user.id);

    if (existingAccount) {
      return formatErrorResponse(
        "This account is linked with GitHub/Google. Please use social login.",
        400,
      );
    }

    // Generate password reset token
    const passwordResetToken = await generatePasswordResetToken(lowerCaseEmail);

    // Send email
    const resetLink = `${env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${passwordResetToken.token}&email=${encodeURIComponent(lowerCaseEmail)}`;

    await sendEmailViaNodemailer({
      template: generatePasswordResetEmail(resetLink),
      subject: "Reset your password",
      to: lowerCaseEmail,
    });

    return formatResponse(
      null,
      "If an account with that email exists, we've sent a password reset link.",
      200,
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return routeErrorHandler(error);
  }
}
