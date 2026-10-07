import { prisma } from "@/lib/prisma";
import { sendUserPushNotification } from "@/services/notification.service";

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
        const accepted = await sendUserPushNotification(reminder.patientId, {
          title: `Medication reminder: ${reminder.title}`,
          body: reminder.description || "It is time to take your medication.",
          channelId: "carelink-alerts",
          data: {
            type: "PILL_REMINDER",
            reminderId: reminder.id,
            patientId: reminder.patientId,
            title: reminder.title,
            scheduledAt: reminder.scheduledAt.toISOString(),
          },
        });

        if (!accepted) continue;

        await prisma.pillReminder.updateMany({
          where: { id: reminder.id, status: "PENDING" },
          data: { status: "SENT" },
        });
        console.log(`Pill reminder ${reminder.id} sent to patient.`);
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
