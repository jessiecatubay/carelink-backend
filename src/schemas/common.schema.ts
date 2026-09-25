import { z } from "zod";

export const uuidSchema = z.string().uuid("Must be a valid identifier");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paginationRequestSchema = z.object({
  body: z.object({}).strict().default({}),
  query: paginationSchema,
  params: z.record(z.string(), z.unknown()).default({}),
});

export const requestSchema = <T extends z.ZodType>(body: T) =>
  z.object({
    body,
    query: z.record(z.string(), z.unknown()).default({}),
    params: z.record(z.string(), z.unknown()).default({}),
  });

export const optionalText = z.string().trim().max(500).optional();
