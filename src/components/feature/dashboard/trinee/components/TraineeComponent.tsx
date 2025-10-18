// components/feature/dashboard/trinee/components/TraineeComponent.tsx
import AddTrainee from "@/components/feature/dashboard/trinee/components/AddTrainee";
import TraineeTable from "@/components/feature/dashboard/trinee/components/TraineeTable";
import { User } from "@prisma/client";
import React from "react";

interface TraineeComponentProps {
  trainees: Partial<User>[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

const TraineeComponent = ({
  trainees,
  totalPages,
  currentPage,
  totalCount,
}: TraineeComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trainee Management</h1>
        <AddTrainee />
      </div>
      <TraineeTable
        trainees={trainees}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={totalCount}
      />
    </div>
  );
};

export default TraineeComponent;
