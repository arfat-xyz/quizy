// TextAnswer.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestSessionWithDetails } from "@/components/feature/dashboard/review-test/interface";

type UserAnswerFromSession = TestSessionWithDetails["userAnswers"][0];

interface TextAnswerProps {
  userAnswer: UserAnswerFromSession;
  score: number;
  isEditing: boolean;
  onScoreChange: (answerId: string, score: number) => void;
}

const TextAnswer = ({
  userAnswer,
  score,
  isEditing,
  onScoreChange,
}: TextAnswerProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-medium text-gray-900">
          {`Candidate's Answer:`}
        </h4>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-gray-700">
            {userAnswer.response || (
              <span className="text-gray-500 italic">No answer provided</span>
            )}
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Label
              htmlFor={`score-${userAnswer.id}`}
              className="min-w-28 font-medium text-gray-900 sm:min-w-24"
            >
              Assign Score:
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id={`score-${userAnswer.id}`}
                type="number"
                min="0"
                max={userAnswer.question.score}
                value={score}
                onChange={e =>
                  onScoreChange(
                    userAnswer.id,
                    Math.max(
                      0,
                      Math.min(
                        userAnswer.question.score,
                        parseInt(e.target.value) || 0,
                      ),
                    ),
                  )
                }
                className="w-20 text-center font-medium"
              />
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                / {userAnswer.question.score} points
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600 sm:mt-0 sm:ml-4">
              Enter a score between 0 and {userAnswer.question.score}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
          <span className="font-medium text-gray-900">Current Score:</span>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            {score} / {userAnswer.question.score}
          </Badge>
          {score !== undefined && (
            <span className="ml-auto text-sm text-gray-600">
              {Math.round((score / userAnswer.question.score) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TextAnswer;
