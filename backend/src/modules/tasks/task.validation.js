import { z } from "zod";

export const STATUSES = [
  "backlog", "todo", "in_progress", "in_review", "done"
];
export const PRIORITIES = ["critical", "high", "medium", "low"];

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  status: z.enum(STATUSES).optional().default("backlog"),
  priority: z.enum(PRIORITIES).optional().default("medium"),
  assigneeId: z.string().nullable().optional(),
  parentTaskId: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  labels: z.array(z.string().trim()).optional().default([])
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(PRIORITIES).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  labels: z.array(z.string().trim()).optional()
});

export const statusSchema = z.object({
  status: z.enum(STATUSES)
});

export const assigneeSchema = z.object({
  assigneeId: z.string().nullable()
});

export const blockSchema = z.object({
  reason: z.string().trim().min(1).max(500)
});
