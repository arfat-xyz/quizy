import { routeErrorHandler } from "@/lib/api-error-handler";
import { formatErrorResponse, formatResponse } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, QuestionType } from "@prisma/client";
import { z } from "zod";

// Validation schema for quiz creation
const CreateQuizSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Question text is required"),
        type: z.nativeEnum(QuestionType),
        score: z.number().min(1, "Score must be at least 1"),
        correct: z.array(z.number()).default([]), // Changed to array for multiple correct answers
        choices: z
          .array(
            z.object({
              text: z.string().min(1, "Choice text is required"),
              index: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, "At least one question is required"),
});

export async function POST(request: Request) {
  try {
    // Authentication check
    const loginUser = await auth();
    if (loginUser?.user?.role !== Role.ADMIN) {
      return formatErrorResponse(
        "You're not authorized for this operation",
        401,
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateQuizSchema.parse(body);

    const { groupId, questions } = validatedData;

    // Verify group exists
    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return formatErrorResponse("Group not found", 404);
    }

    // Create questions in a transaction
    const result = await db.$transaction(async tx => {
      const createdQuestions = [];

      for (const questionData of questions) {
        // Validate MCQ questions have correct answers and choices
        if (questionData.type === QuestionType.MCQ) {
          if (!questionData.choices || questionData.choices.length < 2) {
            throw new Error("MCQ questions must have at least 2 choices");
          }

          // Validate at least one correct answer for MCQ
          if (questionData.correct.length === 0) {
            throw new Error(
              "MCQ questions must have at least one correct answer",
            );
          }

          // Validate correct answer indices are within bounds
          const maxChoiceIndex = questionData.choices.length - 1;
          const invalidCorrectIndices = questionData.correct.filter(
            correctIndex => correctIndex < 0 || correctIndex > maxChoiceIndex,
          );

          if (invalidCorrectIndices.length > 0) {
            throw new Error("Correct answer indices are out of bounds");
          }

          // Validate all choices have unique indices
          const choiceIndices = questionData.choices.map(
            choice => choice.index,
          );
          const uniqueIndices = new Set(choiceIndices);
          if (uniqueIndices.size !== choiceIndices.length) {
            throw new Error("Choice indices must be unique");
          }
        }

        // Validate TEXT questions don't have choices or correct answers
        if (questionData.type === QuestionType.TEXT) {
          if (questionData.choices && questionData.choices.length > 0) {
            throw new Error("TEXT questions should not have choices");
          }
          if (questionData.correct.length > 0) {
            throw new Error("TEXT questions should not have correct answers");
          }
        }

        // Create the question with correct as an array
        const question = await tx.question.create({
          data: {
            text: questionData.text,
            type: questionData.type,
            score: questionData.score,
            correct: questionData.correct, // Now storing as array
            groupId: groupId,
            choices: {
              create:
                questionData.type === QuestionType.MCQ
                  ? questionData.choices?.map(choice => ({
                      text: choice.text,
                      index: choice.index,
                    })) || []
                  : [],
            },
          },
          include: {
            choices: {
              orderBy: { index: "asc" },
            },
          },
        });

        createdQuestions.push(question);
      }

      return createdQuestions;
    });

    return formatResponse(
      {
        message: "Quiz created successfully",
        questions: result,
        count: result.length,
      },
      "Quiz creation successful",
      201,
    );
  } catch (error) {
    console.error("Quiz creation error:", error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return formatErrorResponse("Invalid input data", 400);
    }

    if (error instanceof Error && error.message.includes("Group not found")) {
      return formatErrorResponse("Group not found", 404);
    }

    if (
      error instanceof Error &&
      (error.message.includes("MCQ questions must have") ||
        error.message.includes("Correct answer indices") ||
        error.message.includes("TEXT questions should not") ||
        error.message.includes("Choice indices must be unique"))
    ) {
      return formatErrorResponse(error.message, 400);
    }

    return routeErrorHandler(error);
  }
}

// Optional: GET endpoint to fetch quizzes for a group
export async function GET(request: Request) {
  try {
    const loginUser = await auth();
    if (loginUser?.user?.role !== Role.ADMIN) {
      return formatErrorResponse(
        "You're not authorized for this operation",
        401,
      );
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return formatErrorResponse("Group ID is required", 400);
    }

    const questions = await db.question.findMany({
      where: { groupId },
      include: {
        choices: {
          orderBy: { index: "asc" },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return formatResponse(
      {
        questions,
        count: questions.length,
      },
      "Questions fetched successfully",
    );
  } catch (error) {
    console.error("Fetch questions error:", error);
    return routeErrorHandler(error);
  }
}
