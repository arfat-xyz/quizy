import z from "zod";

// Schema for position form validation
export const PositionSchema = z.object({
  name: z.string().min(1, "Position name is required"),
});
