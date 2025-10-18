// SessionsTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubmittedSession } from "@/components/feature/dashboard/review/interface";
import SessionTableRow from "@/components/feature/dashboard/review/SessionTableRow";

interface SessionsTableProps {
  submittedSessions: SubmittedSession[];
}

const SessionsTable = ({ submittedSessions }: SessionsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Test & Position</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submittedSessions.map(session => (
            <SessionTableRow key={session.id} session={session} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SessionsTable;
