"use client";
import AddGroup from "@/components/feature/dashboard/quiz/components/AddGroup";
import AddPosition from "@/components/feature/dashboard/quiz/components/AddPosition";
import AddQuiz from "@/components/feature/dashboard/quiz/components/AddQuiz";
import QuizTable from "@/components/feature/dashboard/quiz/components/QuizTable";
import { Choice, Group, Position, Question } from "@prisma/client";

const QuizComponent = ({
  // allPositions,
  allGroups,
  currentPage,
  quizzes,
  totalCount,
  totalPages,
  limit,
}: {
  allPositions: Position[];
  quizzes: (Question & {
    group: Group;
    choices: Choice[];
  })[];
  allGroups: Group[];
  limit: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) => {
  return (
    <div>
      <AddPosition />
      {/* <CreateTestAndGroup allPositions={allPositions} /> */}
      <AddGroup />
      <AddQuiz allGroups={allGroups} />
      <QuizTable
        quizzes={quizzes}
        currentPage={currentPage}
        totalCount={totalCount}
        totalPages={totalPages}
        limit={limit}
      />
      {/* <AddQuiz /> */}
    </div>
  );
};

export default QuizComponent;
