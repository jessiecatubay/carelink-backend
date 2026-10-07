import { prisma } from "@/lib/prisma";
import { emitPillReminder } from "@/lib/socket";
import {
  sendPatientCaregiversNotification,
  sendUserPushNotification,
} from "@/services/notification.service";

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

        // 3. Also emit real-time socket event for active in-app sessions (caregivers + patient)
        try {
          emitPillReminder(reminder.patientId, {
            id: reminder.id,
            title: pillHeader,
            description: reminder.description,
            scheduledAt: reminder.scheduledAt.toISOString(),
          });
        } catch (socketErr) {
          console.warn(`Socket emission failed for reminder ${reminder.id}:`, socketErr);
        }

        // Mark reminder as SENT
        await prisma.pillReminder.updateMany({
          where: { id: reminder.id, status: "PENDING" },
          data: { status: "SENT" },
        });

        console.log(`✅ Pill reminder ${reminder.id} ("${pillHeader}") sent to non-patient caregivers for patient ${reminder.patientId}.`);
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
