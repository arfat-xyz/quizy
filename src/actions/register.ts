"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/zod-schemas/auth";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import { sendEmailViaNodemailer } from "@/lib/mail";
import { env } from "@/lib/envs";
import { generateVerificationEmail } from "@/lib/email-template-generator";
// import { generateVerificationToken } from "@/lib/token";
// import { sendVerificationEmail } from "@/lib/mail";

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  try {
    // Validate the input data
    const validatedData = RegisterSchema.parse(data);

    //  If the data is invalid, return an error
    if (!validatedData) {
      return { error: "Invalid input data" };
    }

    //  Destructure the validated data
    const { email, name, password, passwordConfirmation } = validatedData;

    // Check if passwords match
    if (password !== passwordConfirmation) {
      return { error: "Passwords do not match" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check to see if user already exists
    const userExists = await db.user.findFirst({
      where: {
        email,
      },
    });

    // If the user exists, return an error
    if (userExists) {
      if (!userExists?.emailVerified) {
        const verificationToken = await generateVerificationToken(email);
        await sendEmailViaNodemailer({
          template: generateVerificationEmail(
            `${env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken.token}`,
          ),
          subject: "Verify your email",
          to: email,
        }).catch(e => {
          console.error("Error sending email:", e);
        });
        return { success: "Email Verification was sent" };
      }
      return { error: "Email already is in use. Please try another one." };
    }

    const lowerCaseEmail = email.toLowerCase();

    // Create the user
    await db.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
      },
    });

    // Generate Verification Token
    const verificationToken = await generateVerificationToken(email);
    await sendEmailViaNodemailer({
      template: generateVerificationEmail(
        `${env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken.token}`,
      ),
      subject: "Verify your email",
      to: email,
    });

    return { success: "Email Verification was sent" };
  } catch (error) {
    // Handle the error, specifically check for a 503 error
    console.error("Database error:", error);

    if ((error as { code: string }).code === "ETIMEDOUT") {
      return {
        error: "Unable to connect to the database. Please try again later.",
      };
    } else if ((error as { code: string }).code === "503") {
      return {
        error: "Service temporarily unavailable. Please try again later.",
      };
    } else {
      return { error: "An unexpected error occurred. Please try again later." };
    }
  }
};
