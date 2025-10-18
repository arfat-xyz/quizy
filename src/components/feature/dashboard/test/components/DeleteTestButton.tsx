"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteTestButtonProps {
  testId: string;
  testName: string;
}

const DeleteTestButton = ({ testId, testName }: DeleteTestButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Test deleted successfully!");
        router.refresh();
        setIsOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete test");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error(
        error instanceof Error ? error.message : "Error deleting test",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the test{" "}
              <strong>{`"${testName}"`}</strong>? This action cannot be undone
              and will permanently remove all test data.
              <br />
              <br />
              This will also delete all associated:
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Test groups and configurations</li>
                <li>Assigned tests to users</li>
                <li>User test sessions and answers</li>
                <li>Test question references</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteTestButton;
