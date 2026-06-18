import { z } from "zod";

export const createAssignmentSchema = z.object({
  module: z.string().trim().min(1),
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  role: z.string().trim().optional().default("RESPONSIBLE"),
  note: z.string().trim().optional().nullable(),
});

export const updateAssignmentSchema = z.object({
  role: z.string().trim().optional(),
  note: z.string().trim().optional().nullable(),
});
