import { prisma } from "../lib/prisma";
import { UserData } from "@/types/user";

export class UserRepository {
  async create(data: UserData) {
    return await prisma.user.create({data});
  }

  async findByEmail(email: string) {
    return await prisma.user.findFirst({ where: { email } });
  }

  async update(email: string, data: Partial<UserData>) {
    return await prisma.user.update({ where: { email }, data, });
  }
}