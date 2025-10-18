"use client";
import GlobalPagination from "@/components/shared/GlobalPagination";
import React, { useState } from "react";
export function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Example: Calculate total pages based on your data
  const totalItems = 247; // This would come from your API/data
  const totalPages = Math.ceil(totalItems / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log(`Page changed to: ${page}`);
    // Call your API here with new page
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    console.log(`Limit changed to: ${newLimit}`);
    // Call your API here with new limit
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Global Pagination Component</h2>
        <p className="text-muted-foreground">
          Current Page: {currentPage} | Items per page: {limit} | Total Items:{" "}
          {totalItems}
        </p>
      </div>

      {/* Your content here */}
      <div className="bg-card min-h-[400px] rounded-lg border p-6">
        <h3 className="mb-4 font-semibold">Content Area</h3>
        <p className="text-muted-foreground">
          Showing items {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalItems)} of {totalItems}
        </p>
        {/* Your data list/table would go here */}
      </div>

      <GlobalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        limit={limit}
        limits={[10, 25, 50, 100]}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        updateUrl={true}
      />
    </div>
  );
}
