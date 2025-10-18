// EmptyState.tsx
import React from "react";
import { FileText } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground h-12 w-12" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">No Submitted Tests</h1>
          <p className="text-muted-foreground mb-6">
            There are no submitted tests to review at the moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
