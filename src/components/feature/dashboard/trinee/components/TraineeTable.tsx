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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, Eye, Mail } from "lucide-react";
import { User } from "@prisma/client";
import GlobalPagination from "@/components/shared/GlobalPagination"; // Adjust import path as needed
import { format } from "date-fns";

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
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const handleDelete = async (traineeId: string) => {
    if (confirm("Are you sure you want to delete this trainee?")) {
      try {
        const response = await fetch(`/api/admin/trainee/${traineeId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Failed to delete trainee");
        }
      } catch (error) {
        console.error("Error deleting trainee:", error);
        alert("Error deleting trainee");
      }
    }
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

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
              <TableHead>Status</TableHead>
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
                  <TableCell className="font-medium">{trainee.name}</TableCell>
                  <TableCell>{trainee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {trainee.userName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trainee.createdAt ? formatDate(trainee.createdAt) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSendEmail(trainee.email!)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(trainee.id!)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
