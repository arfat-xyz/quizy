import { Position, Test } from "@prisma/client";

export interface TestWithPosition extends Test {
  position: Position;
  _count?: {
    assignedTests: number;
    // testSessions: number;
  };
}
