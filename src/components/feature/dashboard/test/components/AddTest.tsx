"use client";
import { Group, Position, User } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestFormSchema } from "@/zod-schemas";

type TestFormData = z.infer<typeof TestFormSchema>;

const AddTest = ({
  groups,
  positions,
  trainees,
}: {
  groups: Group[];
  positions: Position[];
  trainees: User[];
}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);
  const [selectedTrainees, setSelectedTrainees] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TestFormData>({
    resolver: zodResolver(TestFormSchema),
    defaultValues: {
      testGroups: [],
      assignedUsers: [],
    },
  });

  // Add group to test
  const addGroupToTest = (groupId: string) => {
    if (selectedGroups.includes(groupId)) return;

    const updatedGroups = [...selectedGroups, groupId];
    setSelectedGroups(updatedGroups);
    setValue("testGroups", updatedGroups);
  };

  // Remove group from test
  const removeGroupFromTest = (groupId: string) => {
    const updatedGroups = selectedGroups.filter(g => g !== groupId);
    setSelectedGroups(updatedGroups);
    setValue("testGroups", updatedGroups);
  };

  // Handle trainee selection
  const handleTraineeSelect = (value: string) => {
    const newSelectedTrainees = selectedTrainees.includes(value)
      ? selectedTrainees.filter(id => id !== value)
      : [...selectedTrainees, value];

    setSelectedTrainees(newSelectedTrainees);
    setValue("assignedUsers", newSelectedTrainees);
  };

  // Remove selected trainee
  const removeTrainee = (traineeId: string) => {
    const newSelectedTrainees = selectedTrainees.filter(id => id !== traineeId);
    setSelectedTrainees(newSelectedTrainees);
    setValue("assignedUsers", newSelectedTrainees);
  };

  const onSubmit = async (data: TestFormData) => {
    setLoading(true);

    try {
      // Format the date properly for MongoDB (set to start of day)
      const formattedData = {
        ...data,
        date: new Date(data.date + "T00:00:00").toISOString(),
      };
      console.log(formattedData);
      const response = await fetch("/api/admin/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Test created successfully!");
        reset();
        setSelectedGroups([]);
        setSelectedTrainees([]);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create test");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog closes
      reset();
      setSelectedGroups([]);
      setSelectedTrainees([]);
    }
  };

  return (
    <>
      {/* Add Test Button - Outside of Dialog */}
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Add Test
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create New Test
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Test Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Enter test name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Position Selection */}
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select onValueChange={value => setValue("positionId", value)}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.positionId && (
                <p className="text-sm text-red-600">
                  {errors.positionId.message}
                </p>
              )}
            </div>

            {/* Date (Only) */}
            <div className="space-y-2">
              <Label htmlFor="date">Test Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMin">Duration (minutes) *</Label>
              <Input
                id="durationMin"
                type="number"
                {...register("durationMin", { valueAsNumber: true })}
                placeholder="Enter duration in minutes"
                min="1"
              />
              {errors.durationMin && (
                <p className="text-sm text-red-600">
                  {errors.durationMin.message}
                </p>
              )}
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <Label>Question Groups *</Label>

              {/* Group Selector */}
              <Select onValueChange={addGroupToTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group to add" />
                </SelectTrigger>
                <SelectContent>
                  {groups
                    .filter(group => !selectedGroups.includes(group.id))
                    .map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Selected Groups */}
              {selectedGroups.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium">
                    Selected Groups:
                  </Label>
                  {selectedGroups.map(groupId => {
                    const group = groups.find(g => g.id === groupId);
                    return (
                      <div
                        key={groupId}
                        className="flex items-center justify-between rounded-md bg-gray-50 p-3"
                      >
                        <span className="font-medium">{group?.name}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeGroupFromTest(groupId)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.testGroups && (
                <p className="text-sm text-red-600">
                  {errors.testGroups.message}
                </p>
              )}
            </div>

            {/* Assign to Users (Optional) */}
            <div className="space-y-2">
              <Label>Assign to Trainees (Optional)</Label>

              {/* Multi-select for trainees */}
              <Select onValueChange={handleTraineeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trainees to assign..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {trainees.map(trainee => (
                    <SelectItem
                      key={trainee.id}
                      value={trainee.id}
                      className={
                        selectedTrainees.includes(trainee.id)
                          ? "bg-blue-50"
                          : ""
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span> ({trainee.email || trainee.userName})</span>
                        {selectedTrainees.includes(trainee.id) && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected trainees display */}
              {selectedTrainees.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium">
                    Selected Trainees:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrainees.map(traineeId => {
                      const trainee = trainees.find(t => t.id === traineeId);
                      return (
                        <div
                          key={traineeId}
                          className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          <span>{trainee?.name || trainee?.userName}</span>
                          <button
                            type="button"
                            onClick={() => removeTrainee(traineeId)}
                            className="rounded-full hover:bg-blue-200"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Select trainees to assign this test to
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTest;
