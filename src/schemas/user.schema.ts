import { requestSchema, uuidSchema } from "@/schemas/common.schema";
import { z } from "zod";

const roleSchema = z.enum(["PATIENT", "NON_PATIENT", "USER"]);

export const signupSchema = requestSchema(
  z
    .object({
      firstName: z.string().trim().min(2, "First name is required").max(50),
      lastName: z.string().trim().min(2, "Last name is required").max(50),
      email: z.string().trim().pipe(z.email("Please provide a valid email address").toLowerCase()),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    })
    .strict(),
);

export const loginSchema = requestSchema(
  z
    .object({
      email: z.string().trim().pipe(z.email("Please provide a valid email address").toLowerCase()),
      password: z.string().min(1, "Password is required"),
    })
    .strict(),
);

export const refreshSchema = requestSchema(
  z
    .object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    })
    .strict(),
);

export const onboardingSchema = requestSchema(
  z.looseObject({
    userId: z.string().trim(),
    email: z.string().trim().pipe(z.email().toLowerCase()),
    role: z.string(),
    age: z.coerce.number(),
    gender: z.string().trim(),
    medicalConditions: z.string().trim(),
    notes: z.string().trim().optional(),
    relationship: z.string().trim(),
    emergencyContact: z.string().trim(),
    onBoarded: z.boolean(),
  })
);

export const getUserByIdSchema = requestSchema(
  z.object({ id: uuidSchema }).strict(),
);

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
