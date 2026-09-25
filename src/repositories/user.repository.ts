import { prisma } from "../lib/prisma";
import { UserData } from "@/types/user";

export class UserRepository {
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        password: true,
        role: true,
      },
    });

    if (user?.role === "NON_PATIENT") {
      return await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          nonPatientProfile: true,
          nonPatientConnections: {
            where: {
              status: "CONNECTED",
            },
            include: {
              patient: {
                include: {
                  patientProfile: true,
                },
              },
            },
          },
        },
      });
    }

    if (user?.role === "PATIENT") {
      return await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          patientProfile: true,
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
    }

    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        patientProfile: true,
        nonPatientProfile: true,
      },
    });
  }

  async create(data: UserData) {
    return await prisma.user.create({
      data,
      include: {
        patientProfile: true,
        nonPatientProfile: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findFirst({
      where: {
        email,
      },
      include: {
        patientProfile: true,
        nonPatientProfile: true,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return await prisma.user.findUnique({
      where: {
        googleId,
      },
      include: {
        patientProfile: true,
        nonPatientProfile: true,
      },
    });
  }

  async linkGoogleAccount(userId: string, googleId: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        googleId,
        emailVerified: true,
      },
      include: {
        patientProfile: true,
        nonPatientProfile: true,
      },
    });
  }

  async getUserByCode(connectionCode: string) {
    return await prisma.patientProfile.findUnique({
      where: {
        connectionCode,
      },
      select: {
        userId: true,
      },
    });
  }

  async update(email: string, data: Partial<UserData>) {
    const userType = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (userType?.role === "PATIENT") {
      await prisma.patientProfile.update({
        where: {
          userId: userType.id,
        },
        data,
      });
    } else if (userType?.role === "NON_PATIENT") {
      await prisma.nonPatientProfile.update({
        where: {
          userId: userType.id,
        },
        data: {
          emergencyContact: data.emergencyContact,
        },
      });
    }

    return await prisma.user.update({
      where: {
        email,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      },
    });
  }

  async onBoardUser(email: string) {
    return await prisma.user.update({
      where: {
        email,
      },
      data: {
        onBoarded: true,
      },
    });
  }

  async changePassword(id: string, newPassword: string) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: newPassword,
      },
    });
  }
}
