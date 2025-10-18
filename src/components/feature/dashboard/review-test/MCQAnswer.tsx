// MCQAnswer.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { TestSessionWithDetails } from "@/components/feature/dashboard/review-test/interface";

type UserAnswerFromSession = TestSessionWithDetails["userAnswers"][0];

interface MCQAnswerProps {
  userAnswer: UserAnswerFromSession;
}

const MCQAnswer = ({ userAnswer }: MCQAnswerProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{`Candidate's Selection:`}</h4>
      <div className="space-y-3">
        {userAnswer.question.choices.map((choice, choiceIndex) => {
          const isSelected = userAnswer.response
            .split(",")
            .map(Number)
            .includes(choiceIndex);
          const isCorrectAnswer =
            userAnswer.question.correct.includes(choiceIndex);

          return (
            <div
              key={choice.id}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                isCorrectAnswer
                  ? "border-green-300 bg-green-50 shadow-sm"
                  : isSelected
                    ? "border-red-300 bg-red-50 shadow-sm"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isCorrectAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isSelected ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <span
                  className={`text-sm ${
                    isCorrectAnswer
                      ? "font-medium text-green-900"
                      : isSelected
                        ? "text-red-900"
                        : "text-gray-700"
                  }`}
                >
                  {choice.text}
                </span>
              </div>

              <div className="flex-shrink-0">
                {isCorrectAnswer && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Correct Answer
                  </Badge>
                )}
                {isSelected && !isCorrectAnswer && (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800"
                  >
                    {`Candidate's Choice`}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MCQAnswer;
