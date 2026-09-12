import { requestSchema, uuidSchema } from "@/schemas/common.schema";
import { z } from "zod";

export const commandValueSchema = z.enum([
  "FOOD",
  "WATER",
  "ASSISTANCE",
  "EMERGENCY",
  "SATISFIED",
]);

export const vitalsSchema = requestSchema(
  z
    .object({
      deviceId: z.string().trim().min(1).max(100),
      temperature: z.coerce.number().finite().min(-50).max(100),
      heartRate: z.coerce.number().int().min(0).max(300),
      sensorContact: z.boolean(),
    })
    .strict(),
);

const connectedNonpatientSchema = z.object({
  nonPatientId: uuidSchema,
});

const connectedNonpatientsInput = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, z.array(connectedNonpatientSchema).min(1));

export const deviceCommandSchema = requestSchema(
  z
    .object({
      deviceId: z.string().trim().min(1).max(100),
      command: commandValueSchema,
      patientId: uuidSchema,
      connectedNonpatients: connectedNonpatientsInput,
    })
    .strict(),
);
