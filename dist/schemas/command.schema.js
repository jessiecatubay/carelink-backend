import { paginationSchema, requestSchema } from "./common.schema.js";
import { z } from "zod";
export const commandQuerySchema = z.object({
    body: z.record(z.string(), z.unknown()).default({}),
    query: paginationSchema,
    params: z.record(z.string(), z.unknown()).default({}),
});
export const emptyRequestSchema = requestSchema(z.record(z.string(), z.unknown()));
//# sourceMappingURL=command.schema.js.map