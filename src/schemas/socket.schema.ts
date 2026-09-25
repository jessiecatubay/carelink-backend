import { commandValueSchema, vitalsSchema } from "@/schemas/device.schema";
import { z } from "zod";

const timestampSchema = z.string().datetime({ offset: true });

export const patientVitalsEventSchema = z
  .object({
    deviceId: z.string().trim().min(1).max(100),
    temperature: z.number().finite(),
    heartRate: z.number().int().min(0).max(300),
    sensorContact: z.boolean(),
    receivedAt: timestampSchema,
    patientId: z.string().uuid().optional(),
  })
  .passthrough();

export const patientAlertEventSchema = z
  .object({
    id: z.string().min(1).optional(),
    command: commandValueSchema.optional(),
    alertType: commandValueSchema.optional(),
    status: z.enum(["Pending", "Satisfied"]).optional(),
    timestamp: timestampSchema,
    recordedAt: timestampSchema,
    patientId: z.string().uuid().optional(),
  })
  .passthrough()
  .refine((payload) => payload.command || payload.alertType, {
    message: "command or alertType is required",
  });
