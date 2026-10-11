import { prisma } from "@/lib/prisma";

type CreatePillReminderInput = {
  patientId?: unknown;
  title?: unknown;
  description?: unknown;
  scheduledAt?: unknown;
  daysOfWeek?: unknown;
  timeString?: unknown;
};

export function getNextRecurringDate(
  daysOfWeek: number[],
  targetHour: number,
  targetMinute: number,
  fromDate = new Date(),
): Date {
  if (!daysOfWeek || daysOfWeek.length === 0) {
    return fromDate;
  }

  const uniqueDays = Array.from(new Set(daysOfWeek)).sort((a, b) => a - b);

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(fromDate);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(targetHour, targetMinute, 0, 0);

    const candidateDay = candidate.getDay();

    if (uniqueDays.includes(candidateDay) && candidate.getTime() > fromDate.getTime()) {
      return candidate;
    }
  }

  const fallback = new Date(fromDate);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(targetHour, targetMinute, 0, 0);
  return fallback;
}

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

  const daysOfWeek = Array.isArray(input.daysOfWeek)
    ? input.daysOfWeek.map(Number).filter((d) => !Number.isNaN(d) && d >= 0 && d <= 6)
    : [];
  const timeString = typeof input.timeString === "string" ? input.timeString.trim() : null;

  let scheduledAt: Date;

  if (daysOfWeek.length > 0 && timeString) {
    const [hourStr, minStr] = timeString.split(":");
    const hour = parseInt(hourStr || "0", 10);
    const minute = parseInt(minStr || "0", 10);
    scheduledAt = getNextRecurringDate(daysOfWeek, hour, minute, new Date());
  } else if (input.scheduledAt) {
    scheduledAt = new Date(String(input.scheduledAt));
  } else {
    scheduledAt = new Date(NaN);
  }

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
        "Patient, pill name, and a future scheduled date/time or repeat days are required",
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
      data: {
        patientId,
        createdById,
        title,
        description,
        scheduledAt,
        daysOfWeek,
        timeString,
      },
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

type UpdatePillReminderInput = {
  title?: unknown;
  description?: unknown;
  scheduledAt?: unknown;
  daysOfWeek?: unknown;
  timeString?: unknown;
};

export async function UpdatePillReminderService(
  userId: string,
  reminderId: string,
  input: UpdatePillReminderInput,
) {
  if (!reminderId) {
    return { code: 400, status: "error", message: "Reminder ID is required" };
  }

  try {
    const existing = await prisma.pillReminder.findUnique({
      where: { id: reminderId },
    });

    if (!existing) {
      return { code: 404, status: "error", message: "Pill reminder not found" };
    }

    if (
      existing.createdById !== userId &&
      !(await hasPatientConnection(userId, existing.patientId))
    ) {
      return {
        code: 403,
        status: "error",
        message: "You are not authorized to update this reminder",
      };
    }

    const title =
      typeof input.title === "string" && input.title.trim()
        ? input.title.trim()
        : existing.title;
    const description =
      input.description !== undefined
        ? typeof input.description === "string"
          ? input.description.trim()
          : null
        : existing.description;

    const daysOfWeek =
      input.daysOfWeek !== undefined
        ? Array.isArray(input.daysOfWeek)
          ? input.daysOfWeek
              .map(Number)
              .filter((d) => !Number.isNaN(d) && d >= 0 && d <= 6)
          : []
        : existing.daysOfWeek;

    const timeString =
      input.timeString !== undefined
        ? typeof input.timeString === "string"
          ? input.timeString.trim()
          : null
        : existing.timeString;

    let scheduledAt: Date;

    if (daysOfWeek.length > 0 && timeString) {
      const [hourStr, minStr] = timeString.split(":");
      const hour = parseInt(hourStr || "0", 10);
      const minute = parseInt(minStr || "0", 10);
      scheduledAt = getNextRecurringDate(daysOfWeek, hour, minute, new Date());
    } else if (input.scheduledAt) {
      scheduledAt = new Date(String(input.scheduledAt));
    } else {
      scheduledAt = existing.scheduledAt;
    }

    const updated = await prisma.pillReminder.update({
      where: { id: reminderId },
      data: {
        title,
        description,
        scheduledAt,
        daysOfWeek,
        timeString,
        status: "PENDING",
      },
    });

    return {
      code: 200,
      status: "success",
      message: "Pill reminder updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("UpdatePillReminderService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to update pill reminder",
    };
  }
}

export async function DeletePillReminderService(
  userId: string,
  reminderId: string,
) {
  if (!reminderId) {
    return { code: 400, status: "error", message: "Reminder ID is required" };
  }

  try {
    const existing = await prisma.pillReminder.findUnique({
      where: { id: reminderId },
    });

    if (!existing) {
      return { code: 404, status: "error", message: "Pill reminder not found" };
    }

    if (
      existing.createdById !== userId &&
      !(await hasPatientConnection(userId, existing.patientId))
    ) {
      return {
        code: 403,
        status: "error",
        message: "You are not authorized to delete this reminder",
      };
    }

    await prisma.pillReminder.delete({
      where: { id: reminderId },
    });

    return {
      code: 200,
      status: "success",
      message: "Pill reminder deleted successfully",
      data: { id: reminderId },
    };
  } catch (error) {
    console.error("DeletePillReminderService error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to delete pill reminder",
    };
  }
}
