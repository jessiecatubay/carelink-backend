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

export interface RemoteData {
  deviceId: string;
  command: Command;
}