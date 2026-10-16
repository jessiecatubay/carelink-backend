import { Expo } from "expo-server-sdk";

import { prisma } from "../lib/prisma";

import { expo } from "../lib/expo";
import { firebaseAdminMessaging } from "../lib/firebaseAdmin";

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
  const isExpo = Expo.isExpoPushToken(token);
  const isNativeDeviceToken =
    platform === "android-fcm" ||
    platform === "fcm" ||
    (typeof platform === "string" && platform.includes("fcm")) ||
    token.length > 20;

  if (!isExpo && !isNativeDeviceToken) {
    throw new Error("Invalid push token: must be an Expo push token or native device push token");
  }

  console.log("Saving push token:", {
    userId,
    token: token.substring(0, 15) + "...",
    platform,
  });

  const record = await prisma.pushToken.upsert({
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

  // Remove any stale push tokens for this user under the same platform category
  // (e.g. older Expo push tokens from previous installs or logins)
  try {
    const isFcm = platform === "android-fcm" || platform === "fcm";
    if (isFcm) {
      await prisma.pushToken.deleteMany({
        where: {
          userId,
          platform: { in: ["android-fcm", "fcm"] },
          token: { not: token },
        },
      });
    } else {
      await prisma.pushToken.deleteMany({
        where: {
          userId,
          platform: { notIn: ["android-fcm", "fcm"] },
          token: { not: token },
        },
      });
    }
  } catch (cleanErr) {
    console.warn("Could not clean old push tokens:", cleanErr);
  }

  return record;
}

export async function sendNativeFcmEmergencyNotification(
  fcmTokens: string[],
  notification: CareLinkNotification,
): Promise<boolean> {
  if (!firebaseAdminMessaging) {
    console.warn("Firebase Admin Messaging is not initialized (check environment variables).");
    return false;
  }

  if (fcmTokens.length === 0) {
    return false;
  }

  console.log("=================================");
  console.log("SEND NATIVE FCM EMERGENCY NOTIFICATION");
  console.log("FCM tokens count:", fcmTokens.length);

  // FCM data payload requires all string values
  const stringData: Record<string, string> = {
    command: "EMERGENCY",
    type: "EMERGENCY",
    alertType: "EMERGENCY",
    title: String(notification.title || "EMERGENCY ALERT"),
    body: String(notification.body || "Emergency assistance requested."),
    sound: "alert_sound.wav",
    channelId: "carelink-emergency-v3",
    timestamp: new Date().toISOString(),
  };

  if (notification.data) {
    for (const [key, value] of Object.entries(notification.data)) {
      if (value !== undefined && value !== null) {
        stringData[key] = typeof value === "string" ? value : JSON.stringify(value);
      }
    }
  }

  try {
    // Pure DATA-ONLY message so Android OS does not post standard tray fallback
    // and CareLinkFirebaseMessagingService.onMessageReceived() triggers EmergencyAlertActivity.
    const response = await firebaseAdminMessaging.sendEachForMulticast({
      tokens: fcmTokens,
      data: stringData,
      notification: {
        title: stringData.title,
        body: stringData.body,
      },
      android: {
        priority: "high",
        notification: {
          channelId: "carelink-emergency-v3",
          sound: "alert_sound",
          priority: "max",
          defaultSound: false,
        },
      },
    });

    console.log("Native FCM emergency response:", {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    return response.successCount > 0;
  } catch (error) {
    console.error("Failed to send native FCM emergency message:", error);
    return false;
  }
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
    notification.channelId === "carelink-emergency-v3" ||
    notification.channelId === "carelink-emergency-v2" ||
    (notification.data?.command as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.type as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.alertType as string)?.toUpperCase() === "EMERGENCY" ||
    notification.title.toLowerCase().includes("emergency");

  const messages = validTokens.map((token) => {
    if (isEmergency) {
      return {
        to: token,
        priority: "high" as const,
        channelId: "carelink-emergency-v3",
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
      platform: true,
    },
  });

  if (pushTokens.length === 0) {
    return false;
  }

  console.log("User push tokens:", pushTokens);

  const isEmergency =
    notification.channelId === "carelink-emergency-v3" ||
    notification.channelId === "carelink-emergency-v2" ||
    (notification.data?.command as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.type as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.alertType as string)?.toUpperCase() === "EMERGENCY" ||
    notification.title.toLowerCase().includes("emergency");

  if (isEmergency) {
    const fcmTokens = pushTokens
      .filter((item) => item.platform === "android-fcm")
      .map((item) => item.token);

    if (fcmTokens.length > 0) {
      await sendNativeFcmEmergencyNotification(fcmTokens, notification);
    }
  }

  const expoTokens = pushTokens
    .map((item) => item.token)
    .filter((token) => Expo.isExpoPushToken(token));

  return sendPushNotification(expoTokens, notification);
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

  const rawCaregiverTokens = await prisma.pushToken.findMany({
    where: {
      userId: {
        in: targetUserIds,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      userId: true,
      token: true,
      platform: true,
    },
  });

  // Deduplicate to at most 1 token per user per category (expo vs fcm)
  // using the most recently updated token
  const seenUserType = new Set<string>();
  const caregiverTokens: typeof rawCaregiverTokens = [];
  for (const item of rawCaregiverTokens) {
    const isFcm = item.platform === "android-fcm" || item.platform === "fcm";
    const key = `${item.userId}:${isFcm ? "fcm" : "expo"}`;
    if (!seenUserType.has(key)) {
      seenUserType.add(key);
      caregiverTokens.push(item);
    }
  }

  console.log("Caregiver tokens found (deduplicated):", caregiverTokens);

  const isEmergency =
    notification.channelId === "carelink-emergency-v3" ||
    notification.channelId === "carelink-emergency-v2" ||
    (notification.data?.command as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.type as string)?.toUpperCase() === "EMERGENCY" ||
    (notification.data?.alertType as string)?.toUpperCase() === "EMERGENCY" ||
    notification.title.toLowerCase().includes("emergency");

  if (isEmergency) {
    const fcmTokens = Array.from(
      new Set(
        caregiverTokens
          .filter((item) => item.platform === "android-fcm")
          .map((item) => item.token)
      )
    );

    if (fcmTokens.length > 0) {
      await sendNativeFcmEmergencyNotification(fcmTokens, notification);
    }

    // Always send high-priority emergency push to all caregivers with valid Expo tokens
    const expoTokens = Array.from(
      new Set(
        caregiverTokens
          .map((item) => item.token)
          .filter((token) => Expo.isExpoPushToken(token))
      )
    );

    if (expoTokens.length > 0) {
      console.log("Sending emergency Expo push to all connected caregivers:", expoTokens);
      await sendPushNotification(expoTokens, notification);
    }
  } else {
    // Normal notifications (Food, Water, Assistance, Pill Reminder): use standard Expo push
    const expoTokens = Array.from(
      new Set(
        caregiverTokens
          .map((item) => item.token)
          .filter((token) => Expo.isExpoPushToken(token))
      )
    );

    console.log("Sending normal alert Expo push to:", expoTokens);
    await sendPushNotification(expoTokens, notification);
  }

  console.log("=================================");
}

