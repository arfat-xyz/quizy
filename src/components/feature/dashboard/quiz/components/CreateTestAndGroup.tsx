"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Position } from "@prisma/client";

// Schema for test and group creation
const CreateTestAndGroupSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  positionId: z.string().min(1, "Position is required"),
  date: z.date({
    error: "Test date is required",
  }),
  durationMin: z.number().min(1, "Duration must be at least 1 minute"),
  groups: z
    .array(
      z.object({
        name: z.string().min(1, "Group name is required"),
      }),
    )
    .min(1, "At least one group must be added"),
});

type CreateTestAndGroupFormData = z.infer<typeof CreateTestAndGroupSchema>;

interface CreateTestAndGroupProps {
  allPositions: Position[];
}

const CreateTestAndGroup = ({ allPositions }: CreateTestAndGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateTestAndGroupFormData>({
    resolver: zodResolver(CreateTestAndGroupSchema),
    defaultValues: {
      testName: "",
      positionId: "",
      durationMin: 60,
      groups: [{ name: "" }],
    },
  });

  const onSubmit = async (data: CreateTestAndGroupFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-test-with-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(
          result.message || "Test and groups created successfully!",
        );
        form.reset();
        router.refresh();
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to create test and groups");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Group management functions
  const addGroup = () => {
    const currentGroups = form.getValues("groups");
    form.setValue("groups", [...currentGroups, { name: "" }]);
  };

  const removeGroup = (index: number) => {
    const currentGroups = form.getValues("groups");
    if (currentGroups.length > 1) {
      const updatedGroups = currentGroups.filter((_, i) => i !== index);
      form.setValue("groups", updatedGroups);
    }
  };

  const updateGroupName = (index: number, name: string) => {
    const currentGroups = form.getValues("groups");
    const updatedGroups = currentGroups.map((group, i) =>
      i === index ? { ...group, name } : group,
    );
    form.setValue("groups", updatedGroups);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({
        testName: "",
        positionId: "",
        durationMin: 60,
        groups: [{ name: "" }],
      });
    }
  };

  const groups = form.watch("groups");

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Create Test with Groups</Button>
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Test with Groups</DialogTitle>
            <DialogDescription>
              Create a new test and define its groups. Fill in the details
              below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Test Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="testName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter test name"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allPositions.map(position => (
                              <SelectItem key={position.id} value={position.id}>
                                {position.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Enter duration"
                            disabled={loading}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Test Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                              disabled={loading}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Groups Section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <FormLabel>Groups</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGroup}
                    disabled={loading}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Group
                  </Button>
                </div>
                <FormDescription className="mb-4">
                  Define groups for this test. Each group can have different
                  questions.
                </FormDescription>

                <div className="space-y-3">
                  {groups.map((group, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              placeholder={`Group ${index + 1} name`}
                              value={group.name}
                              onChange={e =>
                                updateGroupName(index, e.target.value)
                              }
                              disabled={loading}
                            />
                            {form.formState.errors.groups?.[index]?.name && (
                              <p className="text-destructive mt-1 text-sm font-medium">
                                {
                                  form.formState.errors.groups[index]?.name
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGroup(index)}
                            disabled={loading || groups.length === 1}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.groups &&
                  !form.formState.errors.groups.root && (
                    <p className="text-destructive mt-2 text-sm font-medium">
                      {form.formState.errors.groups.message}
                    </p>
                  )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Test with Groups"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTestAndGroup;
