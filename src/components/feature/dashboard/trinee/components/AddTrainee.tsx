"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { toast } from "sonner";
import { CreateTraineeSchema } from "@/zod-schemas/admin/trainee/CreateTraineeSchema";
import {
  generateRandomPassword,
  generateRandomUsername,
} from "@/zod-schemas/admin/trainee/utils/lib";
import { useRouter } from "next/navigation";

type TraineeFormData = z.infer<typeof CreateTraineeSchema>;

const AddTrainee = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<TraineeFormData>({
    resolver: zodResolver(CreateTraineeSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
  });

  // Generate random username and password when dialog opens
  useEffect(() => {
    if (isOpen) {
      const randomUsername = generateRandomUsername();
      const randomPassword = generateRandomPassword();
      form.setValue("username", randomUsername);
      form.setValue("password", randomPassword);
      // Reset form when dialog opens
      form.reset({
        name: "",
        email: "",
        username: randomUsername,
        password: randomPassword,
      });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: TraineeFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-trainee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Trainee created successfully!");
        form.reset();
        router.refresh();
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to create trainee");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateUsername = () => {
    const newUsername = generateRandomUsername();
    form.setValue("username", newUsername);
  };

  const handleRegeneratePassword = () => {
    const newPassword = generateRandomPassword();
    form.setValue("password", newPassword);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Add Trainee</Button>
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Trainee</DialogTitle>
            <DialogDescription>
              Create a new trainee account. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter full name"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter email address"
                        type="email"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Username</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateUsername}
                        disabled={loading}
                        className="h-7 text-xs"
                      >
                        Regenerate
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter username"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Password</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRegeneratePassword}
                        disabled={loading}
                        className="h-7 text-xs"
                      >
                        Regenerate
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter password"
                        type="text"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  {loading ? "Creating..." : "Create Trainee"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTrainee;
