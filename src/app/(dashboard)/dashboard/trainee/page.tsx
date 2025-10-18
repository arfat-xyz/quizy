// app/dashboard/trainee/page.tsx
import TraineeComponent from "@/components/feature/dashboard/trinee/components/TraineeComponent";
import { db } from "@/lib/db";
import { metaDataGeneratorForNormalPage } from "@/lib/generate-meta";
import { Role } from "@prisma/client";
import React from "react";
export const metadata = metaDataGeneratorForNormalPage(
  "Trainee - Arfat",
  "Your Productivity Dashboard on Arfat.",
);
const TraineePage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const allParams = await searchParams;
  const page = Number(allParams?.page) || 1;
  const limit = Number(allParams?.limit) || 10;
  const skip = (page - 1) * limit;

  // Get trainees with pagination
  const [trainees, totalCount] = await Promise.all([
    db.user.findMany({
      where: {
        role: Role.TEST, // or whatever role you use for trainees
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        userName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.user.count({
      where: {
        role: Role.TEST,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  return (
    <TraineeComponent
      trainees={trainees}
      totalPages={totalPages}
      currentPage={page}
      totalCount={totalCount}
      limit={limit}
    />
  );
};

export default TraineePage;
