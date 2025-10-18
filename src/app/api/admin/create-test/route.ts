// // model Test {
// //   id            String            @id @default(auto()) @map("_id") @db.ObjectId
// //   name          String
// //   position      Position          @relation(fields: [positionId], references: [id])
// //   positionId    String            @db.ObjectId
// //   date          DateTime
// //   durationMin   Int
// //   groups        Group[]
// //   assignedTests AssignedTest[]
// //   testSessions  UserTestSession[]
// //   testQuestions TestQuestion[]
// // }

// // model Group {
// //   id        String     @id @default(auto()) @map("_id") @db.ObjectId
// //   name      String
// //   test      Test       @relation(fields: [testId], references: [id])
// //   testId    String     @db.ObjectId
// //   questions Question[]
// // }

// import { routeErrorHandler } from "@/lib/api-error-handler";
// import { formatErrorResponse, formatResponse } from "@/lib/api-response";
// import { auth } from "@/lib/auth";
// import { db } from "@/lib/db";
// import { generateWelcomeEmail } from "@/lib/email-template-generator";
// import { sendEmailViaNodemailer } from "@/lib/mail";
// import { CreateTraineeSchema } from "@/zod-schemas/admin/trainee/CreateTraineeSchema";
// import { Role } from "@prisma/client";
// import bcrypt from "bcryptjs";

// export async function POST(request: Request) {
//   try {
//     const loginUser = await auth();
//     if (loginUser?.user?.role !== Role.ADMIN)
//       return formatErrorResponse("You're not authorized for this", 401);

//     return formatResponse(
//       {
//         message: "User registered successfully",
//       },
//       "Registration successful",
//       201,
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
//     return routeErrorHandler(error);
//   }
// }
