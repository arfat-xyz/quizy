// components/feature/dashboard/trainee/components/TraineeTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GlobalPagination from "@/components/shared/GlobalPagination";
import { formatDate } from "@/components/feature/dashboard/trinee/utils";
import { User } from "@prisma/client";
import TraineeTableActions from "./TraineeTableActions";
import TraineeUsernameBadge from "./TraineeUsernameBadge";

interface TraineeTableProps {
  trainees: Partial<User>[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  limit: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const TraineeTable = ({
  trainees,
  totalPages,
  currentPage,
  totalCount,
  limit,
  onPageChange,
  onLimitChange,
}: TraineeTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Trainees</h2>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Total: {totalCount}</Badge>
              <div className="text-muted-foreground text-sm">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
                trainees
              </div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No trainees found
                </TableCell>
              </TableRow>
            ) : (
              trainees.map(trainee => (
                <TableRow key={trainee.id}>
                  <TableCell className="font-medium">
                    {trainee.name || "N/A"}
                  </TableCell>
                  <TableCell>{trainee.email}</TableCell>
                  <TableCell>
                    <TraineeUsernameBadge
                      username={trainee.userName || "N/A"}
                    />
                  </TableCell>
                  <TableCell>
                    {trainee.createdAt ? formatDate(trainee.createdAt) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TraineeTableActions
                      traineeId={trainee.id!}
                      email={trainee.email!}
                      name={trainee.name || ""}
                      userName={trainee.userName || ""}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Global Pagination */}
        {totalPages > 0 && (
          <div className="border-t p-4">
            <GlobalPagination
              currentPage={currentPage}
              totalPages={totalPages}
              limit={limit}
              limits={[1, 2, 3, 4, 5, 6, 10, 25, 50, 100]}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
              updateUrl={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TraineeTable;
