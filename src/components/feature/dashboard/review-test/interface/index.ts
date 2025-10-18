import {
  Position,
  QuestionType,
  Test,
  User,
  UserAnswer,
  UserTestSession,
} from "@prisma/client";

export interface TestSessionWithDetails extends UserTestSession {
  user: Pick<User, "id" | "name" | "email" | "userName">;
  test: Test & {
    position: Position;
    testGroups: {
      group: {
        name: string;
        questions: {
          id: string;
          text: string;
          type: QuestionType;
          score: number;
          correct: number[];
          choices: {
            id: string;
            text: string;
            index: number;
          }[];
        }[];
      };
    }[];
  };
  userAnswers: (UserAnswer & {
    question: {
      id: string;
      text: string;
      type: QuestionType;
      score: number;
      correct: number[];
      choices: {
        id: string;
        text: string;
        index: number;
      }[];
    };
  })[];
}
export interface ReviewTestDetailComponentProps {
  testSession: TestSessionWithDetails;
  totalPossibleScore: number;
  currentStatus: string;
}
