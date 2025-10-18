// types.ts
import {
  Choice,
  Position,
  Question,
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

// Extended Question type with all required properties
export type QuestionWithChoices = Question & {
  choices: Choice[];
};

export type UserAnswerWithQuestion = UserAnswer & {
  question: QuestionWithChoices;
};

// Single interface declaration for ReviewTestDetailComponentProps
export interface ReviewTestDetailComponentProps {
  testSession: TestSessionWithDetails;
  totalPossibleScore: number;
  currentStatus: string;
}

export interface ScoreManagementProps {
  scores: Record<string, number>;
  editingScores: Record<string, boolean>;
  isSaving: boolean;
  handleScoreChange: (answerId: string, score: number) => void;
  toggleEditScore: (answerId: string) => void;
  saveScore: (answerId: string) => Promise<void>;
  saveAllScores: () => Promise<void>;
  getTotalScore: () => number;
  getAchievedPercentage: () => number;
}
