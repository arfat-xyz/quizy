import z from "zod";

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});
// Zod schema for form validation
export const TestFormSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  positionId: z.string().min(1, "Position is required"),
  date: z.string().min(1, "Date is required"),
  durationMin: z.number().min(1, "Duration must be at least 1 minute"),
  testGroups: z.array(z.string()).min(1, "At least one test group is required"),
  assignedUsers: z.array(z.string()).optional(),
});
