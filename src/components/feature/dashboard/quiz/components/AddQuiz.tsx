"use client";
import React, { useState } from "react";
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

interface Choice {
  text: string;
  index: number;
}

interface Question {
  text: string;
  type: QuestionType;
  score: number;
  correct?: number; // For MCQ questions
  choices: Choice[];
}

const AddQuiz = ({ allGroups }: { allGroups: Group[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "",
      type: QuestionType.MCQ,
      score: 1,
      correct: 0,
      choices: [{ text: "", index: 0 }],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: QuestionType.MCQ,
        score: 1,
        correct: 0,
        choices: [{ text: "", index: 0 }],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };

    // If changing to TEXT type, clear choices and correct answer
    if (field === "type" && value === QuestionType.TEXT) {
      updatedQuestions[index].choices = [];
      updatedQuestions[index].correct = undefined;
    }

    // If changing to MCQ type and no choices, add one default choice
    if (
      field === "type" &&
      value === QuestionType.MCQ &&
      updatedQuestions[index].choices.length === 0
    ) {
      updatedQuestions[index].choices = [{ text: "", index: 0 }];
      updatedQuestions[index].correct = 0;
    }

    setQuestions(updatedQuestions);
  };

  const addChoice = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newIndex = updatedQuestions[questionIndex].choices.length;
    updatedQuestions[questionIndex].choices.push({ text: "", index: newIndex });
    setQuestions(updatedQuestions);
  };

  const updateChoice = (
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[choiceIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices = updatedQuestions[
      questionIndex
    ].choices.filter((_, index) => index !== choiceIndex);

    // Reindex choices
    updatedQuestions[questionIndex].choices.forEach((choice, index) => {
      choice.index = index;
    });

    // Update correct answer if it was the removed choice
    if (updatedQuestions[questionIndex].correct === choiceIndex) {
      updatedQuestions[questionIndex].correct = 0;
    } else if ((updatedQuestions[questionIndex].correct || 0) > choiceIndex) {
      updatedQuestions[questionIndex].correct =
        (updatedQuestions[questionIndex].correct || 0) - 1;
    }

    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    if (!selectedGroup) {
      toast("Please select a group");
      return;
    }

    try {
      const response = await fetch("/api/admin/create-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          questions: questions,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Quiz created:", result);
        setIsOpen(false);
        // Reset form
        setSelectedGroup("");
        setQuestions([
          {
            text: "",
            type: QuestionType.MCQ,
            score: 1,
            correct: 0,
            choices: [{ text: "", index: 0 }],
          },
        ]);
      } else {
        throw new Error("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Error creating quiz");
    }
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Add Quiz</Button>
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Add questions to create a quiz for the selected group.
            </DialogDescription>
          </DialogHeader>

          {/* Group Selection */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="">Choose a group</option>
                {allGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Questions */}
            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Question {questionIndex + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    Remove
                  </Button>
                </div>

                {/* Question Text */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={e =>
                      updateQuestion(questionIndex, "text", e.target.value)
                    }
                    className="w-full rounded-md border p-2"
                    placeholder="Enter your question"
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={e =>
                      updateQuestion(questionIndex, "type", e.target.value)
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
                    value={question.score}
                    onChange={e =>
                      updateQuestion(
                        questionIndex,
                        "score",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full rounded-md border p-2"
                    min="1"
                  />
                </div>

                {/* MCQ Choices */}
                {question.type === QuestionType.MCQ && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">
                        Choices
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
                      Select Correct Answer
                    </div>

                    {question.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correct === choiceIndex}
                          onChange={() =>
                            updateQuestion(
                              questionIndex,
                              "correct",
                              choiceIndex,
                            )
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
                        {question.choices.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeChoice(questionIndex, choiceIndex)
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
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
              <Button type="button" onClick={handleSubmit}>
                Create Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddQuiz;
