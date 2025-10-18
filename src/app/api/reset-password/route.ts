// @/app/api/auth/reset-password/route.ts
import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { getPasswordResetTokenByToken } from "@/lib/token";
import { ResetPasswordSchema } from "@/zod-schemas/auth/forget-password";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);

    const { email, password, token } = validatedData;
    const lowerCaseEmail = email.toLowerCase();

    // Verify token
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return formatErrorResponse("Invalid or expired reset token", 400);
    }

    if (existingToken.email !== lowerCaseEmail) {
      return formatErrorResponse("Email does not match reset token", 400);
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return formatErrorResponse("Reset token has expired", 400);
    }

    // Check if user exists
    const user = await db.user.findFirst({
      where: { email: lowerCaseEmail },
    });

    if (!user) {
      return formatErrorResponse("User not found", 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return formatResponse({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return routeErrorHandler(error);
  }
}
