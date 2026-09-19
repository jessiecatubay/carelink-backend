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
  const validTokens = tokens.filter((token) =>
    Expo.isExpoPushToken(token)
  );

  if (validTokens.length === 0) {
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default" as const,
    title: notification.title,
    body: notification.body,
    data: notification.data ?? {},
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Expo push notification error:", error);
    }
  }
}

export async function sendUserPushNotification(
  userId: string,
  notification: CareLinkNotification
) {
  const pushTokens = await prisma.pushToken.findMany({
    where: {
      userId,
    },
    select: {
      token: true,
    },
  });

  await sendPushNotification(
    pushTokens.map((item) => item.token),
    notification
  );
}

export async function sendPatientCaregiversNotification(
  patientId: string,
  notification: CareLinkNotification
) {
  const connections = await prisma.patientNonPatient.findMany({
    where: {
      patientId,
      status: "CONNECTED",
    },
    select: {
      nonPatientId: true,
    },
  });

  const nonPatientIds = connections.map(
    (connection) => connection.nonPatientId
  );

  if (nonPatientIds.length === 0) {
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

  await sendPushNotification(
    pushTokens.map((item) => item.token),
    notification
  );
}