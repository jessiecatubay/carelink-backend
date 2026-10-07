import { prisma } from "@/lib/prisma";

type CreatePillReminderInput = {
  patientId?: unknown;
  title?: unknown;
  description?: unknown;
  scheduledAt?: unknown;
};

async function hasPatientConnection(createdById: string, patientId: string) {
  return prisma.patientNonPatient.findUnique({
    where: { patientId_nonPatientId: { patientId, nonPatientId: createdById } },
    select: { id: true },
  });
}

export async function CreatePillReminderService(
  createdById: string,
  input: CreatePillReminderInput,
) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : null;
  const patientId = typeof input.patientId === "string" ? input.patientId : "";
  const scheduledAt = new Date(String(input.scheduledAt ?? ""));

  if (
    !patientId ||
    !title ||
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getTime() <= Date.now()
  ) {
    return {
      code: 400,
      status: "error",
      message:
        "Patient, pill name, and a future scheduled date and time are required",
    };
  }

  try {
    if (!(await hasPatientConnection(createdById, patientId))) {
      return {
        code: 403,
        status: "error",
        message: "You are not connected to this patient",
      };
    }

    const reminder = await prisma.pillReminder.create({
      data: { patientId, createdById, title, description, scheduledAt },
    });

    return {
      code: 201,
      status: "success",
      message: "Pill reminder created successfully",
      data: reminder,
    };
  } catch (error) {
    console.error("CreatePillReminderService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to create pill reminder",
    };
  }
}

export async function ListPillRemindersService(
  createdById: string,
  patientId: string,
) {
  if (!patientId) {
    return { code: 400, status: "error", message: "Patient ID is required" };
  }

  try {
    if (!(await hasPatientConnection(createdById, patientId))) {
      return {
        code: 403,
        status: "error",
        message: "You are not connected to this patient",
      };
    }

    const reminders = await prisma.pillReminder.findMany({
      where: { patientId },
      orderBy: { scheduledAt: "asc" },
    });

    return {
      code: 200,
      status: "success",
      message: "Pill reminders fetched successfully",
      data: reminders,
    };
  } catch (error) {
    console.error("ListPillRemindersService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to fetch pill reminders",
    };
  }
}
