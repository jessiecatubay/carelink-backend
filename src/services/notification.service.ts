import { Expo } from "expo-server-sdk";

import { prisma } from "../lib/prisma";

import { expo } from "../lib/expo";

export type CareLinkNotification = {
  title: string;
  body: string;
  channelId?: string;
  data?: Record<string, unknown>;
};

export async function savePushToken(
  userId: string,
  token: string,
  platform?: string,
) {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error("Invalid Expo push token");
  }

  console.log("Saving push token:", {
    userId,
    token,
    platform,
  });

  return prisma.pushToken.upsert({
    where: {
      token,
    },
    update: {
      userId,
      platform,
      updatedAt: new Date(),
    },
    create: {
      userId,
      token,
      platform,
    },
  });
}

export async function sendPushNotification(
  tokens: string[],
  notification: CareLinkNotification,
): Promise<boolean> {
  console.log("=================================");
  console.log("SEND PUSH NOTIFICATION");
  console.log("Tokens received:", tokens);
  console.log("Notification:", notification);

  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

  console.log("Valid Expo tokens:", validTokens);

  if (validTokens.length === 0) {
    console.log("No valid Expo push tokens found.");
    return false;
  }

  const isEmergency =
    notification.channelId === "carelink-emergency-v2" ||
    (notification.data?.command as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.type as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.alertType as string)?.toUpperCase() === "EMERGENCY" ||
    notification.title.toLowerCase().includes("emergency");

  const messages = validTokens.map((token) => {
    if (isEmergency) {
      // DATA-ONLY message for Critical Emergency alerts:
      // Omit top-level title/body so Android OS/Play Services does not intercept it on fcm_fallback_notification_channel,
      // allowing CareLinkFirebaseMessagingService to receive the message in closed/background state and trigger EmergencyAlertActivity.
      return {
        to: token,
        priority: "high" as const,
        channelId: "carelink-emergency-v2",
        data: {
          ...(notification.data ?? {}),
          command: "EMERGENCY",
          type: "EMERGENCY",
          alertType: "EMERGENCY",
          title: notification.title,
          body: notification.body,
          sound: "alert_sound.wav",
        },
      };
    }

    // Standard notification payload for all regular alerts (Food, Water, Assistance, Pill Reminder)
    return {
      to: token,
      sound: "default" as const,
      title: notification.title,
      body: notification.body,
      priority: "high" as const,
      data: notification.data ?? {},
      channelId: notification.channelId ?? "carelink-alerts",
    };
  });

  console.log("Messages being sent (isEmergency=" + isEmergency + "):", messages);

  const chunks = expo.chunkPushNotifications(messages);
  let accepted = true;

  for (const chunk of chunks) {
    try {
      console.log("Sending Expo notification chunk:", chunk);

      const tickets = await expo.sendPushNotificationsAsync(chunk);

      console.log("Expo push tickets:", tickets);
      if (tickets.some((ticket) => ticket.status !== "ok")) {
        accepted = false;
      }
    } catch (error) {
      console.error("Expo push notification error:", error);
      accepted = false;
    }
  }

  console.log("=================================");
  return accepted;
}

export async function sendUserPushNotification(
  userId: string,
  notification: CareLinkNotification,
): Promise<boolean> {
  console.log("Sending push notification to user:", userId);

  const pushTokens = await prisma.pushToken.findMany({
    where: {
      userId,
    },
    select: {
      token: true,
    },
  });

  if (pushTokens.length === 0) {
    return false;
  }

  console.log("User push tokens:", pushTokens);

  return sendPushNotification(
    pushTokens.map((item) => item.token),
    notification,
  );
}

export async function sendPatientCaregiversNotification(
  patientId: string,
  notification: CareLinkNotification,
  additionalUserIds: string[] = [],
) {
  console.log("=================================");
  console.log("PATIENT CAREGIVER NOTIFICATION");
  console.log("Patient ID:", patientId);
  console.log("Notification:", notification);

  const connections = await prisma.patientNonPatient.findMany({
    where: {
      patientId,
      status: "CONNECTED",
    },
    select: {
      nonPatientId: true,
    },
  });

  console.log("Connected caregivers:", connections);

  const nonPatientIdSet = new Set<string>(
    connections.map((connection) => connection.nonPatientId),
  );

  for (const uid of additionalUserIds) {
    if (uid && typeof uid === "string") {
      nonPatientIdSet.add(uid);
    }
  }

  const targetUserIds = Array.from(nonPatientIdSet);
  console.log("Target non-patient IDs:", targetUserIds);

  if (targetUserIds.length === 0) {
    console.log("No connected non-patients or target caregivers found.");
    return;
  }

  const pushTokens = await prisma.pushToken.findMany({
    where: {
      userId: {
        in: targetUserIds,
      },
    },
    select: {
      token: true,
    },
  });

  console.log("Caregiver push tokens:", pushTokens);

  const uniqueTokens = Array.from(
    new Set(pushTokens.map((item) => item.token).filter(Boolean)),
  );

  console.log("Caregiver unique token strings:", uniqueTokens);

  await sendPushNotification(uniqueTokens, notification);

  console.log("=================================");
}
