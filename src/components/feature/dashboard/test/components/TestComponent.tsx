import AddPosition from "@/components/feature/dashboard/quiz/components/AddPosition";
import AddTest from "@/components/feature/dashboard/test/components/AddTest";
import TestTable from "@/components/feature/dashboard/test/components/TestTable";
import { TestWithPosition } from "@/components/feature/dashboard/test/interface";
import { Group, Position, User } from "@prisma/client";
import React from "react";

const TestComponent = ({
  groups,
  positions,
  trainees,
  tests,
  currentPage,
  limit,
  totalCount,
  totalPages,
}: {
  groups: Group[];
  positions: Position[];
  trainees: User[];
  tests: TestWithPosition[];
  limit: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) => {
  return (
    <div>
      <div className="my-4 flex w-full items-center justify-end gap-4">
        <AddPosition />
        <AddTest groups={groups} positions={positions} trainees={trainees} />
      </div>
      <TestTable
        tests={tests}
        currentPage={currentPage}
        totalCount={totalCount}
        totalPages={totalPages}
        limit={limit}
      />
    </div>
  );
};

export default TestComponent;
