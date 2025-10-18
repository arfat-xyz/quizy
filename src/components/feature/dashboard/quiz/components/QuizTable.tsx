"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Group, Question, QuestionType, Choice } from "@prisma/client";

interface QuizTableProps {
  quizzes: (Question & {
    group: Group;
    choices: Choice[];
  })[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const QuizTable = ({
  quizzes,
  currentPage,
  totalPages,
  totalCount,
}: QuizTableProps) => {
  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MCQ:
        return "Multiple Choice";
      case QuestionType.TEXT:
        return "Text Answer";
      default:
        return type;
    }
  };

  const getQuestionTypeVariant = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MCQ:
        return "secondary";
      case QuestionType.TEXT:
        return "default";
      default:
        return "outline";
    }
  };

  const getCorrectAnswer = (question: Question & { choices: Choice[] }) => {
    if (question.type === QuestionType.TEXT) {
      return "Text Answer";
    }

    if (question.type === QuestionType.MCQ && question.correct !== undefined) {
      const correctChoice = question.choices.find(
        choice => choice.index === question.correct,
      );
      return correctChoice ? correctChoice.text : "No correct answer set";
    }

    return "No correct answer set";
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          No quizzes found. Create your first quiz to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground">
            Showing {quizzes.length} of {totalCount} questions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled={currentPage <= 1}>
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" disabled={currentPage >= totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* Quiz Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead>Choices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map(quiz => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">
                  <div className="max-w-xs">{truncateText(quiz.text)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{quiz.group.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getQuestionTypeVariant(quiz.type)}>
                    {getQuestionTypeLabel(quiz.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {quiz.score} point{quiz.score !== 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-muted-foreground text-sm">
                    {truncateText(getCorrectAnswer(quiz))}
                  </div>
                </TableCell>
                <TableCell>
                  {quiz.type === QuestionType.MCQ ? (
                    <span className="text-muted-foreground text-sm">
                      {quiz.choices.length} choices
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => onEdit?.(quiz)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      // onClick={() => onDelete?.(quiz.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards View */}
      <div className="space-y-4 lg:hidden">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">
                  {truncateText(quiz.text, 100)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{quiz.group.name}</Badge>
                  <Badge variant={getQuestionTypeVariant(quiz.type)}>
                    {getQuestionTypeLabel(quiz.type)}
                  </Badge>
                  <Badge variant="secondary">
                    {quiz.score} point{quiz.score !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Correct Answer: </span>
                <span className="text-muted-foreground">
                  {truncateText(getCorrectAnswer(quiz), 80)}
                </span>
              </div>
              {quiz.type === QuestionType.MCQ && (
                <div>
                  <span className="font-medium">Choices: </span>
                  <span className="text-muted-foreground">
                    {quiz.choices.length} options
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                // onClick={() => onEdit?.(quiz)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                // onClick={() => onDelete?.(quiz.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizTable;
