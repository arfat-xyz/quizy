import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { z } from "zod";

// Zod schema for validation
const SaveAnswerSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  response: z.string().optional().default(""), // Allow empty response but default to empty string
  isAutoSave: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = SaveAnswerSchema.parse(body);
    const { sessionId, questionId, response, isAutoSave } = validatedData;

    console.log("Saving answer:", validatedData);

    // Check if session exists and is not submitted
    const session = await db.userTestSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return formatErrorResponse("Session not found", 404);
    }

    if (session.submitted) {
      return formatErrorResponse("Cannot save answer for submitted test", 400);
    }

    // Verify question exists
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: { choices: true },
    });

    if (!question) {
      return formatErrorResponse("Question not found", 404);
    }

    // Validate response based on question type
    if (question.type === "MCQ") {
      // For MCQ, response should be comma-separated numbers or empty
      if (response && response !== "") {
        const choices = response
          .split(",")
          .map(choice => parseInt(choice.trim()));

        // Check if all choices are valid numbers
        if (choices.some(choice => isNaN(choice))) {
          return formatErrorResponse("Invalid MCQ response format", 400);
        }

        // Check if choices are within valid range
        const maxChoiceIndex = question.choices
          ? question.choices.length - 1
          : 0;
        if (choices.some(choice => choice < 0 || choice > maxChoiceIndex)) {
          return formatErrorResponse("Invalid choice selection", 400);
        }
      }
    }
    // For TEXT questions, any string response is acceptable

    // Check if answer already exists
    const existingAnswer = await db.userAnswer.findFirst({
      where: {
        testSessionId: sessionId,
        questionId: questionId,
      },
    });

    // If it's auto-save and answer already exists with same response, return success without updating
    if (
      isAutoSave &&
      existingAnswer &&
      existingAnswer.response === (response || "")
    ) {
      return formatResponse(
        { ...existingAnswer, skipped: true },
        "Answer already saved (auto-save skipped)",
      );
    }

    let userAnswer;

    if (existingAnswer) {
      // Update existing answer
      userAnswer = await db.userAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          response: response || "", // Ensure response is never null
        },
      });
    } else {
      // Create new answer
      userAnswer = await db.userAnswer.create({
        data: {
          testSessionId: sessionId,
          questionId: questionId,
          response: response || "", // Ensure response is never null
        },
      });
    }

    return formatResponse(
      { ...userAnswer, skipped: false },
      isAutoSave
        ? "Answer auto-saved successfully"
        : "Answer saved successfully",
    );
  } catch (error) {
    console.error("Error saving answer:", error);

    return routeErrorHandler(error);
  }
}
