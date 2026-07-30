import { Role } from "@/generated/prisma/enums";

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
