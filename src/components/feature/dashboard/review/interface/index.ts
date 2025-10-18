// types.ts
import {
  UserTestSession,
  User,
  Test,
  Position,
  UserAnswer,
} from "@prisma/client";

export interface SubmittedSession extends UserTestSession {
  user: Pick<User, "id" | "name" | "email" | "userName">;
  test: Test & {
    position: Pick<Position, "name">;
    testGroups: {
      group: {
        questions: {
          score: number;
          type: string;
        }[];
      };
    }[];
  };
  userAnswers: (UserAnswer & {
    question: {
      score: number;
      type: string;
    };
  })[];
  _count: {
    userAnswers: number;
  };
  totalPossibleScore: number;
  achievedPercentage: number;
}
