import { prisma } from "../lib/prisma";
import { UserData } from "@/types/user";

export class UserRepository {
  async create(data: UserData) {
    return await prisma.user.create({data});
  }

  async findByEmail(email: string) {
    return await prisma.user.findFirst({ where: { email } });
  }
}