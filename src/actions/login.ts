"use server";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginSchema } from "@/zod-schemas/auth";
import { AuthError } from "next-auth";
import z from "zod";

export const login = async (data: z.infer<typeof LoginSchema>) => {
  // Validate input data
  const validatedData = LoginSchema.parse(data);

  if (!validatedData) {
    return { error: "Invalid input data" };
  }

  // Destructure the validated data
  const { email: identifier, password } = validatedData;

  // Check if user exists by email or username
  const userExists = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier.trim().toLowerCase() },
        { userName: identifier.trim() },
      ],
    },
  });
  // If user doesn't exist or doesn't have a password/email, return an error
  if (!userExists || !userExists.password || !userExists.email) {
    return { error: "User not found or invalid credentials" };
  }

  // Check if email is verified
  if (!userExists.emailVerified) {
    return { error: "Please confirm your email address" };
  }

  try {
    await signIn("credentials", {
      email: userExists.email, // Pass the user's email to NextAuth
      password: password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid credentials" };
        }
        default:
          return { error: "An unexpected error occurred during login" };
      }
    }
    throw error;
  }

  return { success: "User logged in successfully" };
};
