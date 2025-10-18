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
        correct: z.number().optional(),
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
      // include: { test: true },
    });

    if (!group) {
      return formatErrorResponse("Group not found", 404);
    }

    // Create questions in a transaction
    const result = await db.$transaction(async tx => {
      const createdQuestions = [];

      for (const questionData of questions) {
        // Validate MCQ questions have correct answer and choices
        if (questionData.type === QuestionType.MCQ) {
          if (questionData.correct === undefined) {
            throw new Error("MCQ questions must have a correct answer");
          }
          if (!questionData.choices || questionData.choices.length < 2) {
            throw new Error("MCQ questions must have at least 2 choices");
          }
          if (questionData.correct >= questionData.choices.length) {
            throw new Error("Correct answer index is out of bounds");
          }
        }

        // Validate TEXT questions don't have choices or correct answer
        if (questionData.type === QuestionType.TEXT) {
          if (questionData.choices && questionData.choices.length > 0) {
            throw new Error("TEXT questions should not have choices");
          }
          if (questionData.correct !== undefined) {
            throw new Error("TEXT questions should not have a correct answer");
          }
        }

        // Create the question
        const question = await tx.question.create({
          data: {
            text: questionData.text,
            type: questionData.type,
            score: questionData.score,
            correct:
              questionData.type === QuestionType.MCQ
                ? questionData.correct
                : null,
            groupId: groupId,
            choices: {
              create:
                questionData.choices?.map(choice => ({
                  text: choice.text,
                  index: choice.index,
                })) || [],
            },
          },
          include: {
            choices: true,
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
      error.message.includes("MCQ questions must have")
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
          // include: {
          //   test: {
          //     select: { name: true },
          //   },
          // },
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
