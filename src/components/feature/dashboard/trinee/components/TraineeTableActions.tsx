"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash2, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TraineeTableActionsProps {
  traineeId: string;
  email: string;
  name: string;
  userName: string;
}

const TraineeTableActions = ({
  traineeId,
  email,
  name,
  userName,
}: TraineeTableActionsProps) => {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{
    delete: boolean;
    email: boolean;
  }>({
    delete: false,
    email: false,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    setLoadingStates(prev => ({ ...prev, delete: true }));

    try {
      const response = await fetch(`/api/admin/trainee/${traineeId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.refresh();
        toast.success("Trainee deleted successfully");
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to delete trainee");
      }
    } catch (error) {
      console.error("Error deleting trainee:", error);
      toast.error("Error deleting trainee");
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  };

  const handleSendEmail = async () => {
    const traineeName = name || userName || "Trainee";
    setLoadingStates(prev => ({ ...prev, email: true }));

    try {
      const response = await fetch("/api/admin/send-trainee-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traineeId,
          email,
          traineeName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Email sent successfully");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending email");
    } finally {
      setLoadingStates(prev => ({ ...prev, email: false }));
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const isActionLoading = loadingStates.delete || loadingStates.email;
  const traineeName = name || userName || "Trainee";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isActionLoading}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            {isActionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleSendEmail}
            disabled={loadingStates.email}
          >
            {loadingStates.email ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Welcome Email
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={openDeleteDialog}
            disabled={loadingStates.delete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Trainee
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="text-destructive h-5 w-5" />
              Delete Trainee
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{traineeName}</strong>?
              This action cannot be undone and all associated data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={loadingStates.delete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingStates.delete}
              className="gap-2"
            >
              {loadingStates.delete && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {loadingStates.delete ? "Deleting..." : "Delete Trainee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TraineeTableActions;
