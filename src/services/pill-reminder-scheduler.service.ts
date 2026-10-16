import { prisma } from "@/lib/prisma";
import { emitPillReminder } from "@/lib/socket";
import {
  sendPatientCaregiversNotification,
  sendUserPushNotification,
} from "@/services/notification.service";
import { getNextRecurringDate } from "@/services/pill-reminder.service";

const POLL_INTERVAL_MS = 30_000;
const BATCH_SIZE = 50;

let isProcessing = false;
let schedulerStarted = false;

async function sendDuePillReminders() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const reminders = await prisma.pillReminder.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      take: BATCH_SIZE,
    });

    for (const reminder of reminders) {
      try {
        const pillHeader = reminder.title.trim();
        const pillDescription =
          reminder.description?.trim() || "It is time for the patient to take their medication.";

        const notificationPayload = {
          title: pillHeader,
          body: pillDescription,
          channelId: "carelink-alerts",
          data: {
            type: "PILL_REMINDER",
            command: "PILL_REMINDER",
            alertType: "PILL_REMINDER",
            reminderId: reminder.id,
            patientId: reminder.patientId,
            createdById: reminder.createdById,
            title: pillHeader,
            description: pillDescription,
            scheduledAt: reminder.scheduledAt.toISOString(),
          },
        };

        // Send mobile push notification to all connected non-patients (caregivers) + creator
        await sendPatientCaregiversNotification(
          reminder.patientId,
          notificationPayload,
          reminder.createdById ? [reminder.createdById] : [],
        );

        // Also send mobile push notification directly to the patient
        try {
          await sendUserPushNotification(reminder.patientId, {
            ...notificationPayload,
            title: `💊 Pill Reminder: ${pillHeader}`,
          });
        } catch (patientPushErr) {
          console.warn(`Push notification to patient ${reminder.patientId} failed:`, patientPushErr);
        }

        // 3. Also emit real-time socket event for active in-app sessions (caregivers + patient)
        try {
          emitPillReminder(reminder.patientId, {
            id: reminder.id,
            title: pillHeader,
            description: reminder.description,
            scheduledAt: reminder.scheduledAt.toISOString(),
            createdById: reminder.createdById,
          });
        } catch (socketErr) {
          console.warn(`Socket emission failed for reminder ${reminder.id}:`, socketErr);
        }

        // If reminder is recurring on specific days, advance to next occurrence
        if (
          Array.isArray(reminder.daysOfWeek) &&
          reminder.daysOfWeek.length > 0
        ) {
          let targetHour = reminder.scheduledAt.getHours();
          let targetMinute = reminder.scheduledAt.getMinutes();

          if (reminder.timeString) {
            const [h, m] = reminder.timeString.split(":");
            targetHour = parseInt(h || "0", 10);
            targetMinute = parseInt(m || "0", 10);
          }

          const nextScheduledAt = getNextRecurringDate(
            reminder.daysOfWeek,
            targetHour,
            targetMinute,
            new Date(),
          );

          await prisma.pillReminder.update({
            where: { id: reminder.id },
            data: {
              scheduledAt: nextScheduledAt,
              status: "PENDING",
            },
          });

          console.log(
            `🔁 Recurring pill reminder ${reminder.id} rescheduled to ${nextScheduledAt.toISOString()}`,
          );
        } else {
          // Mark one-time reminder as SENT
          await prisma.pillReminder.updateMany({
            where: { id: reminder.id, status: "PENDING" },
            data: { status: "SENT" },
          });
        }

        console.log(
          `✅ Pill reminder ${reminder.id} ("${pillHeader}") processed for patient ${reminder.patientId}.`,
        );
      } catch (error) {
        console.error(`Failed to send pill reminder ${reminder.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Pill reminder scheduler failed:", error);
  } finally {
    isProcessing = false;
  }
}

export function startPillReminderScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  void sendDuePillReminders();
  const interval = setInterval(() => {
    void sendDuePillReminders();
  }, POLL_INTERVAL_MS);
  interval.unref();

  console.log("Pill reminder scheduler started.");
}
