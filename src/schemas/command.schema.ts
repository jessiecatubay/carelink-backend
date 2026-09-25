import { paginationSchema, requestSchema } from "@/schemas/common.schema";
import { z } from "zod";

export const commandQuerySchema = z.object({
  body: z.record(z.string(), z.unknown()).default({}),
  query: paginationSchema,
  params: z.record(z.string(), z.unknown()).default({}),
});

export const emptyRequestSchema = requestSchema(
  z.record(z.string(), z.unknown()),
);
