import { toast } from "sonner";

/**
 * frontendErrorResponse
 * Displays a toast notification for error messages on the frontend.
 *
 * @param {Object} params - Parameters for configuring the error response
 * @param {string} params.message - The error message to display (default: "Something went wrong")
 * @returns {void} - Shows a toast notification to the user
 */
export const frontendErrorResponse = ({
  message = "Something went wrong",
}: {
  message: string;
}) => {
  return toast.error(message);
};

/**
 * frontendSuccessResponse
 * Displays a toast notification for successful operations on the frontend.
 *
 * @param {Object} params - Parameters for configuring the success response
 * @param {string} params.message - The success message to display (default: "Response successful")
 * @returns {void} - Shows a toast notification to the user
 */
export const frontendSuccessResponse = ({
  message = "Response successful",
}: {
  message: string;
}) => {
  return toast.success(message);
};
