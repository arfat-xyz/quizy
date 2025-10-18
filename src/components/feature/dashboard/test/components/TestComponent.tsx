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
      <AddTest groups={groups} positions={positions} trainees={trainees} />
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
