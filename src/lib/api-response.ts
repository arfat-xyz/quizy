import { NextResponse } from "next/server"; // Importing NextResponse for structured responses

// Define a generic type for the API response structure
type ApiResponse<T> = {
  success: boolean; // Indicates if the request was successful
  message: string; // Provides a message about the response
  data?: T; // Optional data payload of generic type T
};

/**
 * formatResponse
 * A utility function to standardize successful responses.
 *
 * @param {T} data - The data to include in the response
 * @param {string} [message="Operation completed successfully"] - Optional success message
 * @param {number} [status=200] - HTTP status code (default: 200)
 * @returns {NextResponse} - A formatted JSON response with a success flag, message, and data
 */
export function formatResponse<T>(
  data: T,
  message = "Operation completed successfully",
  status = 200,
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true, // Indicates a successful response
      message, // Success message
      data, // Response data payload
    },
    { status },
  );
}

/**
 * formatErrorResponse
 * A utility function to standardize error responses.
 *
 * @param {string} [message="An error occurred"] - Optional error message
 * @param {number} [status=500] - HTTP status code (default: 500)
 * @returns {NextResponse} - A formatted JSON response with an error flag, message, and null data
 */
export function formatErrorResponse(
  message = "An error occurred",
  status = 500,
) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false, // Indicates an error response
      message, // Error message
      data: null, // No data is provided in case of error
    },
    { status },
  );
}

export class HTTPError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
