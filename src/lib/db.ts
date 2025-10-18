import { PrismaClient } from "@prisma/client";

declare global {
   
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = prisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
