import { Role, Command } from "@/generated/prisma/enums";

export interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  onBoarded?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface DeviceData {
  deviceId: string;
  temperature: number;
  heartRate: number;
  sensorContact: boolean;
}

export interface CommandData {
  deviceId?: string;
  command?: Command;
  status?: string;
}

export interface PatientNonPatient {
  patientId: string;
  nonPatientId: string;
  status: "CONNECTED" | "DISCONNECTED";
}

export interface PatientProfile {
  id: string;
  userId: string;
  connectionCode: string;
  age: number | null;
  gender: string | null;
  notes: string | null;
  emergencyContact: string | null;
  medicalConditions: string | null;
}