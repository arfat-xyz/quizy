"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Group, Question, Choice } from "@prisma/client";
import GlobalPagination from "@/components/shared/GlobalPagination";
import QuizTableRow from "./QuizTableRow";
import EmptyQuizState from "./EmptyQuizState";
import QuizTableHeader from "@/components/feature/dashboard/quiz/components/QuizHeader";

interface QuizTableProps {
  quizzes: (Question & {
    group: Group;
    choices: Choice[];
  })[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

const QuizTable = ({
  quizzes,
  currentPage,
  totalPages,
  totalCount,
  limit,
}: QuizTableProps) => {
  if (!quizzes || quizzes.length === 0) {
    return <EmptyQuizState />;
  }

  return (
    <div className="space-y-6">
      {/* Table Header with Stats */}
      <QuizTableHeader
        currentPage={currentPage}
        totalCount={totalCount}
        limit={limit}
      />

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
              <QuizTableRow key={quiz.id} quiz={quiz} />
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
