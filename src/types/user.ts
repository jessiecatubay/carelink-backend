import { Role } from "@/generated/prisma/enums";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  relationship: string;
  verifiedAt: Date;
}