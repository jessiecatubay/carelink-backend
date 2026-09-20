import { Expo } from "expo-server-sdk";

import { prisma } from "../lib/prisma";

import { expo } from "../lib/expo";

export type CareLinkNotification = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function savePushToken(
  userId: string,
  token: string,
  platform?: string
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
  notification: CareLinkNotification
) {
  console.log("=================================");
  console.log("SEND PUSH NOTIFICATION");
  console.log("Tokens received:", tokens);
  console.log("Notification:", notification);

  const validTokens = tokens.filter((token) =>
    Expo.isExpoPushToken(token)
  );

  console.log("Valid Expo tokens:", validTokens);

  if (validTokens.length === 0) {
    console.log("No valid Expo push tokens found.");
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default" as const,
    title: notification.title,
    body: notification.body,
    data: notification.data ?? {},
  }));

  console.log("Messages being sent:", messages);

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      console.log("Sending Expo notification chunk:", chunk);

      const tickets = await expo.sendPushNotificationsAsync(chunk);

      console.log("Expo push tickets:", tickets);
    } catch (error) {
      console.error("Expo push notification error:", error);
    }
  }

  console.log("=================================");
}

export async function sendUserPushNotification(
  userId: string,
  notification: CareLinkNotification
) {
  console.log("Sending push notification to user:", userId);

  const pushTokens = await prisma.pushToken.findMany({
    where: {
      userId,
    },
    select: {
      token: true,
    },
  });

  console.log("User push tokens:", pushTokens);

  await sendPushNotification(
    pushTokens.map((item) => item.token),
    notification
  );
}

export async function sendPatientCaregiversNotification(
  patientId: string,
  notification: CareLinkNotification
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

  const nonPatientIds = connections.map(
    (connection) => connection.nonPatientId
  );

  console.log("Non-patient IDs:", nonPatientIds);

  if (nonPatientIds.length === 0) {
    console.log("No connected non-patients found.");
    return;
  }

  const pushTokens = await prisma.pushToken.findMany({
    where: {
      userId: {
        in: nonPatientIds,
      },
    },
    select: {
      token: true,
    },
  });

  console.log("Caregiver push tokens:", pushTokens);

  const tokens = pushTokens.map((item) => item.token);

  console.log("Caregiver token strings:", tokens);

  await sendPushNotification(tokens, notification);

  console.log("=================================");
}