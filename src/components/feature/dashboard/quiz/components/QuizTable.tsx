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
import GlobalPagination from "@/components/shared/GlobalPagination";

interface QuizTableProps {
  quizzes: (Question & {
    group: Group;
    choices: Choice[];
  })[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onEdit?: (quiz: Question & { group: Group; choices: Choice[] }) => void;
  onDelete?: (quizId: string) => void;
}

const QuizTable = ({
  quizzes,
  currentPage,
  totalPages,
  totalCount,
  limit,
  onEdit,
  onDelete,
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

    if (question.type === QuestionType.MCQ && question.correct.length > 0) {
      // Handle multiple correct answers
      const correctChoices = question.choices
        .filter(choice => question.correct.includes(choice.index))
        .map(choice => choice.text);

      if (correctChoices.length === 0) {
        return "No correct answer set";
      }

      if (correctChoices.length === 1) {
        return correctChoices[0];
      }

      // For multiple correct answers, show count or first few
      if (correctChoices.length <= 2) {
        return correctChoices.join(", ");
      }

      return `${correctChoices.length} correct answers`;
    }

    return "No correct answer set";
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    <div className="space-y-6">
      {/* Table Header with Stats */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Questions</h2>
          <p className="text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
            questions
          </p>
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
              <TableHead>Correct Answers</TableHead>
              <TableHead>Choices</TableHead>
              <TableHead>Created</TableHead>
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
                    {quiz.type === QuestionType.MCQ ? (
                      <div className="space-y-1">
                        <span>{getCorrectAnswer(quiz)}</span>
                        {quiz.correct.length > 1 && (
                          <div className="text-xs text-blue-600">
                            ({quiz.correct.length} selected)
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {quiz.type === QuestionType.MCQ ? (
                    <span className="text-muted-foreground text-sm">
                      {quiz.choices.length} options
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(quiz.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(quiz)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete?.(quiz.id)}
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

      {/* Global Pagination */}
      <GlobalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        limit={limit}
        limits={[1, 2, 3, 4, 10, 25, 50, 100]}
        updateUrl={true}
      />
    </div>
  );
};

export default QuizTable;
