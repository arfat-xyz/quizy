"use client";
import GlobalPagination from "@/components/shared/GlobalPagination";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TestWithPosition } from "@/components/feature/dashboard/test/interface";
import { formatDate } from "@/components/feature/dashboard/trinee/utils";
import DeleteTestButton from "@/components/feature/dashboard/test/components/DeleteTestButton";

const TestTable = ({
  tests,
  currentPage,
  limit,
  totalPages,
}: {
  tests: TestWithPosition[];
  limit: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No tests found
                </TableCell>
              </TableRow>
            ) : (
              tests.map(test => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.position.name}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(test.date)}</TableCell>
                  <TableCell>{test.durationMin}m</TableCell>
                  <TableCell>{test._count?.assignedTests || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DeleteTestButton testId={test.id} testName={test.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Global Pagination */}
      {tests.length > 0 && (
        <GlobalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          limits={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 100]}
          updateUrl={true}
        />
      )}
    </div>
  );
};

export default TestTable;
