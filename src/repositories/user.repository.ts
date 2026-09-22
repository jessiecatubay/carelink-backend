import { prisma } from "../lib/prisma";
import { UserData } from "@/types/user";

export class UserRepository {
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        role: true,
      },
    });

    if (user?.role === "NON_PATIENT") {
      return await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          nonPatientConnections: {
            where: {
              status: "CONNECTED",
            },
            include: {
              patient: true,
            },
          },
        },
      });
    } else if (user?.role === "PATIENT") {
      return await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          patientConnections: {
            where: {
              status: "CONNECTED",
            },
            include: {
              nonPatient: true,
            },
          },
        },
      });
    } else {
      return await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          patientProfile: true,
          nonPatientProfile: true,
        },
      });
    }
  }

  async create(data: UserData) {
    return await prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return await prisma.user.findFirst({
      where: { email },
      include: { patientProfile: true, nonPatientProfile: true },
    });
  }

  async getUserByCode(connectionCode: string) {
    return await prisma.patientProfile.findUnique({
      where: {
        connectionCode: connectionCode,
      },
      select: {
        userId: true,
      },
    });
  }

  async update(email: string, data: Partial<UserData>) {
    const userType = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        role: true,
      },
    });

    if(userType?.role === "PATIENT") {
      await prisma.patientProfile.update({where: {userId: userType.id}, data})
    } else

    if(userType?.role === "NON_PATIENT") {
      await prisma.nonPatientProfile.update({where: {userId: userType.id}, data: {
        emergencyContact: data.emergencyContact
      }})
    }

    return await prisma.user.update({ where: { email }, data: {
      firstName: data.firstName,
      lastName: data.lastName
    } });
  }

  async onBoardUser(email: string) {
    return await prisma.user.update({
      where: { email },
      data: { onBoarded: true },
    });
  }
}
