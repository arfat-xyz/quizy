import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { formatErrorResponse } from "./api-response";

/**
 * routeErrorHandler
 * Handles various error types, including validation errors, generic errors, and unknown errors.
 *
 * @param {unknown} error - The error object to handle
 * @returns {Response} - A formatted error response based on the type of error
 */
export function routeErrorHandler(error: unknown) {
  if (error instanceof ZodError) {
    // In Zod v4, use `issues` instead of `errors`
    const validationErrors = error.issues
      .map(issue => issue.message)
      .join(", ");
    return formatErrorResponse(validationErrors, 422);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return formatErrorResponse("Feature request conflict error.", 409);
    }
  } else if (error instanceof Error) {
    return formatErrorResponse(error.message, 500);
  } else {
    return formatErrorResponse(
      "Internal server error. Please try again later",
      500,
    );
  }
}
