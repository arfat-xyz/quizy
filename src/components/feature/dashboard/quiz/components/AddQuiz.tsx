"use client";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Group, QuestionType } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Zod schemas
const choiceSchema = z.object({
  text: z.string().min(1, "Choice text is required"),
  index: z.number(),
});

const questionSchema = z
  .object({
    text: z.string().min(1, "Question text is required"),
    type: z.nativeEnum(QuestionType),
    score: z.number().min(1, "Score must be at least 1"),
    correct: z.array(z.number()),
    choices: z.array(choiceSchema),
  })
  .refine(
    data => {
      if (data.type === QuestionType.MCQ) {
        return data.choices.length >= 2;
      }
      return true;
    },
    {
      message: "MCQ questions must have at least 2 choices",
      path: ["choices"],
    },
  )
  .refine(
    data => {
      if (data.type === QuestionType.MCQ) {
        return data.correct.length >= 1;
      }
      return true;
    },
    {
      message: "MCQ questions must have at least one correct answer",
      path: ["correct"],
    },
  );

const formSchema = z.object({
  groupId: z.string().min(1, "Please select a group"),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddQuizProps {
  allGroups: Group[];
}

const AddQuiz = ({ allGroups }: AddQuizProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: "",
      questions: [
        {
          text: "",
          type: QuestionType.MCQ,
          score: 1,
          correct: [],
          choices: [{ text: "", index: 0 }],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const watchQuestions = watch("questions");

  const addQuestion = () => {
    appendQuestion({
      text: "",
      type: QuestionType.MCQ,
      score: 1,
      correct: [],
      choices: [{ text: "", index: 0 }],
    });
  };

  const updateQuestionType = async (
    questionIndex: number,
    newType: QuestionType,
  ) => {
    setValue(`questions.${questionIndex}.type`, newType);

    if (newType === QuestionType.TEXT) {
      setValue(`questions.${questionIndex}.choices`, []);
      setValue(`questions.${questionIndex}.correct`, []);
    } else if (newType === QuestionType.MCQ) {
      const currentChoices = watchQuestions[questionIndex]?.choices;
      if (!currentChoices || currentChoices.length === 0) {
        setValue(`questions.${questionIndex}.choices`, [
          { text: "", index: 0 },
        ]);
      }
      setValue(`questions.${questionIndex}.correct`, []);
    }

    await trigger(`questions.${questionIndex}`);
  };

  // Manage choices manually per question using watch/setValue to avoid
  // nesting useFieldArray incorrectly. This keeps types safe and avoids any.
  const addChoice = (questionIndex: number) => {
    const currentChoices = watchQuestions[questionIndex]?.choices || [];
    const newIndex = currentChoices.length;

    const newChoices = [...currentChoices, { text: "", index: newIndex }];
    setValue(`questions.${questionIndex}.choices`, newChoices);
  };

  const updateChoice = (
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ) => {
    setValue(`questions.${questionIndex}.choices.${choiceIndex}.text`, text);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const currentChoices = watchQuestions[questionIndex]?.choices || [];

    if (currentChoices.length <= 1) {
      toast.error("At least one choice is required");
      return;
    }

    // Reindex remaining choices after removal
    const updatedChoices = currentChoices
      .filter((_, index) => index !== choiceIndex)
      .map((choice, index) => ({ ...choice, index }));

    setValue(`questions.${questionIndex}.choices`, updatedChoices);

    // Update correct answers
    const currentCorrect = watchQuestions[questionIndex]?.correct || [];
    const updatedCorrect = currentCorrect
      .filter(correctIndex => correctIndex !== choiceIndex)
      .map(correctIndex =>
        correctIndex > choiceIndex ? correctIndex - 1 : correctIndex,
      );

    setValue(`questions.${questionIndex}.correct`, updatedCorrect);
  };

  const toggleCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
    const currentCorrect = watchQuestions[questionIndex]?.correct || [];
    let updatedCorrect: number[];

    if (currentCorrect.includes(choiceIndex)) {
      updatedCorrect = currentCorrect.filter(index => index !== choiceIndex);
    } else {
      updatedCorrect = [...currentCorrect, choiceIndex];
    }

    setValue(`questions.${questionIndex}.correct`, updatedCorrect);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Submitting data:", data);

      const response = await fetch("/api/admin/create-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: data.groupId,
          questions: data.questions,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Quiz created:", result);
        toast.success("Quiz created successfully!");
        router.refresh();
        setIsOpen(false);
        reset();
      } else {
        throw new Error("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Error creating quiz");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Add Quiz</Button>
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Add questions to create a quiz for the selected group. For MCQ
              questions, you can select multiple correct answers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Group Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Group
              </label>
              <select
                {...register("groupId")}
                className="w-full rounded-md border p-2"
              >
                <option value="">Choose a group</option>
                {allGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {errors.groupId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.groupId.message}
                </p>
              )}
            </div>

            {/* Questions */}
            {questionFields.map((field, questionIndex) => (
              <div key={field.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Question {questionIndex + 1}
                  </h3>
                  {questionFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Question Text */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Question Text
                  </label>
                  <input
                    {...register(`questions.${questionIndex}.text`)}
                    className="w-full rounded-md border p-2"
                    placeholder="Enter your question"
                  />
                  {errors.questions?.[questionIndex]?.text && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.questions[questionIndex]?.text?.message}
                    </p>
                  )}
                </div>

                {/* Question Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Question Type
                  </label>
                  <select
                    value={
                      watchQuestions[questionIndex]?.type || QuestionType.MCQ
                    }
                    onChange={e =>
                      updateQuestionType(
                        questionIndex,
                        e.target.value as QuestionType,
                      )
                    }
                    className="w-full rounded-md border p-2"
                  >
                    <option value={QuestionType.MCQ}>
                      Multiple Choice (MCQ)
                    </option>
                    <option value={QuestionType.TEXT}>Text Answer</option>
                  </select>
                </div>

                {/* Score */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Score
                  </label>
                  <input
                    type="number"
                    {...register(`questions.${questionIndex}.score`, {
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-md border p-2"
                    min="1"
                  />
                  {errors.questions?.[questionIndex]?.score && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.questions[questionIndex]?.score?.message}
                    </p>
                  )}
                </div>

                {/* MCQ Choices */}
                {watchQuestions[questionIndex]?.type === QuestionType.MCQ && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">
                        Choices (Select multiple correct answers)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addChoice(questionIndex)}
                      >
                        Add Choice
                      </Button>
                    </div>

                    <div className="text-sm font-medium text-gray-700">
                      Select all correct answers (
                      {watchQuestions[questionIndex]?.correct?.length || 0}{" "}
                      selected)
                    </div>

                    {watchQuestions[questionIndex]?.choices?.map(
                      (choice, choiceIndex) => (
                        <div
                          key={choiceIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={
                              watchQuestions[questionIndex]?.correct?.includes(
                                choiceIndex,
                              ) || false
                            }
                            onChange={() =>
                              toggleCorrectAnswer(questionIndex, choiceIndex)
                            }
                            className="mr-2"
                          />
                          <input
                            type="text"
                            value={choice.text}
                            onChange={e =>
                              updateChoice(
                                questionIndex,
                                choiceIndex,
                                e.target.value,
                              )
                            }
                            className="flex-1 rounded-md border p-2"
                            placeholder={`Choice ${choiceIndex + 1}`}
                          />
                          {watchQuestions[questionIndex]?.choices &&
                            watchQuestions[questionIndex].choices.length >
                              1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRemoveChoice(questionIndex, choiceIndex)
                                }
                              >
                                Remove
                              </Button>
                            )}
                        </div>
                      ),
                    )}

                    {/* Choice validation errors */}
                    {errors.questions?.[questionIndex]?.choices && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.questions[questionIndex]?.choices?.message}
                      </p>
                    )}
                    {errors.questions?.[questionIndex]?.correct && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.questions[questionIndex]?.correct?.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Question Button */}
            <Button type="button" variant="outline" onClick={addQuestion}>
              Add Another Question
            </Button>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Quiz"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddQuiz;
