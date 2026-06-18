import { z } from "zod";

export const submitApprovalSchema = z.object({
  module: z.string().trim().min(1),
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  approverId: z.string().trim().optional().nullable(),
  decisionNote: z.string().trim().optional().nullable(),
});

export const decideApprovalSchema = z.object({
  decisionNote: z.string().trim().optional().nullable(),
  rejectReason: z.string().trim().optional().nullable(),
});
