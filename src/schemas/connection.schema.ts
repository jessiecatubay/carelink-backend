import { requestSchema, uuidSchema } from "@/schemas/common.schema";
import { z } from "zod";

export const connectSchema = requestSchema(
  z
    .object({
      nonPatientId: uuidSchema,
      connectionCode: z.string().trim().min(1).max(100),
    })
    .strict(),
);

export const connectedNonpatientsSchema = requestSchema(z.object({}).strict());

export const updateConnectionSchema = requestSchema(
  z
    .object({
      patientId: uuidSchema,
      nonPatientId: uuidSchema,
      status: z.enum(["CONNECTED", "DISCONNECTED"]).optional(),
      currentPatient: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) => data.status !== undefined || data.currentPatient !== undefined,
      { message: "status or currentPatient is required" },
    ),
);

export const patientProfileSchema = requestSchema(
  z
    .object({
      patientId: uuidSchema,
      age: z.coerce.number().int().min(0).max(150).optional(),
      gender: z.string().trim().max(50).optional(),
      notes: z.string().trim().max(2000).optional(),
      illness: z.string().trim().max(500).optional(),
      medicalConditions: z.string().trim().max(2000).optional(),
      emergencyContact: z.string().trim().max(50).optional(),
    })
    .strict(),
);

export const generateConnectionCodeSchema = requestSchema(
  z.object({ id: uuidSchema }).strict(),
);
