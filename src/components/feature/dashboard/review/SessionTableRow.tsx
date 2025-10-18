// SessionTableRow.tsx
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, User as UserIcon, Eye } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { SubmittedSession } from "@/components/feature/dashboard/review/interface";
import { useScoreEvaluation } from "@/components/feature/dashboard/review/useScoreEvaluation";

interface SessionTableRowProps {
  session: SubmittedSession;
}

const SessionTableRow = ({ session }: SessionTableRowProps) => {
  const { getScoreVariant, getScoreIcon, getScoreLabel } = useScoreEvaluation();
  const scoreVariant = getScoreVariant(session.achievedPercentage);
  const scoreIcon = getScoreIcon(session.achievedPercentage);
  const scoreLabel = getScoreLabel(session.achievedPercentage);
  const answeredPercentage = calculateAnsweredPercentage(session);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
            <UserIcon className="text-primary h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {session.user.name || session.user.userName || "Unknown User"}
            </span>
            <span className="text-muted-foreground text-xs">
              {session.user.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{session.test.name}</span>
          <Badge variant="outline" className="mt-1 w-fit">
            {session.test.position.name}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{formatDateTime(session.endedAt!)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            {formatDuration(session.startedAt, session.endedAt)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-row items-center gap-1">
          <Badge
            variant={scoreVariant}
            className="flex w-fit items-center gap-1"
          >
            {scoreIcon}
            {session.totalScore.toFixed(1)} / {session.totalPossibleScore}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {session.achievedPercentage.toFixed(1)}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={scoreVariant} className="flex w-fit items-center gap-1">
          {scoreLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {session._count.userAnswers} answered
            </Badge>
          </div>
          <span className="text-muted-foreground text-xs">
            {answeredPercentage}% completed
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Link href={`/dashboard/review-test/${session.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};

const calculateAnsweredPercentage = (session: SubmittedSession) => {
  const totalQuestions = session.test.testGroups.reduce((total, testGroup) => {
    return total + testGroup.group.questions.length;
  }, 0);

  return totalQuestions > 0
    ? Math.round((session._count.userAnswers / totalQuestions) * 100)
    : 0;
};

export default SessionTableRow;
