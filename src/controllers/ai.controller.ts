import { Request, Response } from "express";
import { z } from "zod";
import {
  getCarelinkResponse,
  AIMessage,
  PatientMedicationContext,
} from "../services/ai.service";
import { prisma } from "../lib/prisma";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().min(1),
      }),
    )
    .min(1),
  patientId: z.string().optional(),
});

export async function chatWithCarelink(
  req: Request,
  res: Response,
) {
  try {
    const parsed = chatSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Invalid chat messages",
        errors: parsed.error.flatten(),
      });
    }

    const messages: AIMessage[] = parsed.data.messages;
    const requestedPatientId = parsed.data.patientId;
    const currentUserId = (req as any).user?.id as string | undefined;

    let patientContext: PatientMedicationContext | undefined = undefined;

    if (currentUserId) {
      let targetPatientId = requestedPatientId;

      // Automatically find current connected patient for caregiver if not explicitly passed
      if (!targetPatientId) {
        const connection = await prisma.patientNonPatient.findFirst({
          where: {
            nonPatientId: currentUserId,
            status: "CONNECTED",
          },
          orderBy: { currentPatient: "desc" },
          select: { patientId: true },
        });
        targetPatientId = connection?.patientId;
      }

      if (targetPatientId) {
        const patient = await prisma.user.findUnique({
          where: { id: targetPatientId },
          include: { patientProfile: true },
        });

        if (patient) {
          const pillReminders = await prisma.pillReminder.findMany({
            where: {
              patientId: targetPatientId,
              status: { not: "CANCELLED" },
            },
            orderBy: { scheduledAt: "asc" },
          });

          const PHILIPPINE_TIME_ZONE = "Asia/Manila";
          const now = new Date();
          const currentDayName = now.toLocaleDateString("en-US", {
            timeZone: PHILIPPINE_TIME_ZONE,
            weekday: "long",
          });
          const currentDateFormatted = now.toLocaleDateString("en-US", {
            timeZone: PHILIPPINE_TIME_ZONE,
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const dayOfWeekStr = now.toLocaleDateString("en-US", {
            timeZone: PHILIPPINE_TIME_ZONE,
            weekday: "short",
          });
          const dayMap: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
          };
          const currentDayOfWeekNum = dayMap[dayOfWeekStr] ?? now.getDay();
          const todayDateOnly = now.toLocaleDateString("en-US", {
            timeZone: PHILIPPINE_TIME_ZONE,
          });

          const mappedReminders = pillReminders.map((r) => {
            let isToday = false;
            if (r.daysOfWeek && r.daysOfWeek.length > 0) {
              isToday = r.daysOfWeek.includes(currentDayOfWeekNum);
            } else {
              const reminderDateOnly = new Date(r.scheduledAt).toLocaleDateString("en-US", {
                timeZone: PHILIPPINE_TIME_ZONE,
              });
              isToday = reminderDateOnly === todayDateOnly;
            }

            return {
              id: r.id,
              title: r.title,
              description: r.description,
              timeString: r.timeString,
              scheduledAt: r.scheduledAt,
              daysOfWeek: r.daysOfWeek,
              status: r.status,
              isScheduledForToday: isToday,
            };
          });

          const patientName =
            [patient.firstName, patient.lastName].filter(Boolean).join(" ").trim() ||
            "Connected Patient";

          patientContext = {
            patientId: targetPatientId,
            patientName,
            age: patient.patientProfile?.age,
            gender: patient.patientProfile?.gender,
            medicalConditions: patient.patientProfile?.medicalConditions,
            notes: patient.patientProfile?.notes,
            currentDayName,
            currentDateFormatted,
            pillReminders: mappedReminders,
          };
        }
      }
    }

    const response = await getCarelinkResponse(messages, patientContext);

    return res.status(200).json({
      success: true,
      status: "success",
      data: {
        response,
        patientName: patientContext?.patientName,
        todayMedicationsCount:
          patientContext?.pillReminders?.filter((p) => p.isScheduledForToday).length ?? 0,
      },
    });
  } catch (error) {
    console.error("Carelink AI error:", error);

    return res.status(500).json({
      success: false,
      status: "error",
      message: "Carelink was unable to process your request.",
    });
  }
}


export async function getEmergencyIncidentAdvisory(
  req: Request,
  res: Response,
) {
  try {
    const patientId = (req.body?.patientId || req.query?.patientId) as string | undefined;
    const deviceId = (req.body?.deviceId || req.query?.deviceId) as string | undefined;
    const caregiverId = (req as any).user?.id as string | undefined;

    if (!patientId && !caregiverId) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "patientId or authenticated session is required",
      });
    }

    const { generateEmergencyAdvisory } = await import(
      "../services/emergency-advisory.service"
    );

    const advisory = await generateEmergencyAdvisory({
      patientId,
      deviceId,
      caregiverId,
    });


    return res.status(200).json({
      success: true,
      status: "success",
      data: advisory,
    });
  } catch (error) {
    console.error("Carelink emergency advisory error:", error);

    return res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to generate emergency incident advisory",
    });
  }
}