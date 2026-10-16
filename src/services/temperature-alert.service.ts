import { prisma } from "@/lib/prisma";
import { emitPatientAlert } from "@/lib/socket";
import { sendPatientCaregiversNotification } from "./notification.service";

/**
 * Normal body temperature boundaries for CareLink
 * Matches frontend VitalCard normal range: 36.0°C - 37.5°C
 */
export const NORMAL_MIN_TEMPERATURE = 36.0;
export const NORMAL_MAX_TEMPERATURE = 37.5;

/**
 * Below 25.0°C indicates an unattached sensor, zero/null calibration,
 * or ambient room temperature reading rather than valid human skin contact.
 */
export const MIN_PLAUSIBLE_SKIN_TEMPERATURE = 25.0;

/**
 * Anti-spam cooldown: 5 minutes between duplicate alerts for the same condition
 */
export const TEMPERATURE_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

export interface LastAlertState {
  type: "HIGH" | "LOW";
  temperature: number;
  alertedAt: number;
}

// In-memory per-patient cooldown and state tracking
export const lastAlertByPatientId = new Map<string, LastAlertState>();

export interface CheckTemperatureParams {
  patientId: string;
  temperature: number;
  sensorContact?: boolean;
  deviceId?: string;
  db?: typeof prisma;
  sendNotificationFn?: typeof sendPatientCaregiversNotification;
  emitAlertFn?: typeof emitPatientAlert;
}

export interface CheckTemperatureResult {
  alertSent: boolean;
  reason?: string;
  condition?: "HIGH" | "LOW" | "NORMAL" | "INVALID";
}

/**
 * Helper to normalize Fahrenheit to Celsius if hardware transmits values > 60
 */
export function normalizeTemperatureToCelsius(rawTemp: number): number {
  if (rawTemp > 60) {
    return (rawTemp - 32) * (5 / 9);
  }
  return rawTemp;
}

/**
 * Checks whether the patient's temperature is beyond or below the normal range (36.0°C - 37.5°C)
 * and sends an immediate push notification to all connected non-patients (caregivers).
 */
export async function checkAndSendTemperatureAlert(
  params: CheckTemperatureParams,
): Promise<CheckTemperatureResult> {
  const {
    patientId,
    sensorContact,
    deviceId,
    db = prisma,
    sendNotificationFn = sendPatientCaregiversNotification,
    emitAlertFn = emitPatientAlert,
  } = params;
  const rawTemp = params.temperature;

  if (!patientId || typeof rawTemp !== "number" || isNaN(rawTemp)) {
    return { alertSent: false, reason: "Invalid patientId or temperature" };
  }

  // Normalize Fahrenheit to Celsius if needed
  const temperature = Number(normalizeTemperatureToCelsius(rawTemp).toFixed(1));

  // If sensor is explicitly detached or temperature is below plausible skin reading (ambient room/zero)
  if (sensorContact === false || temperature < MIN_PLAUSIBLE_SKIN_TEMPERATURE) {
    return {
      alertSent: false,
      reason: "Sensor detached or reading ambient room temperature",
      condition: "INVALID",
    };
  }

  const now = Date.now();

  // 1. Check if temperature is in normal range (36.0°C - 37.5°C)
  if (temperature >= NORMAL_MIN_TEMPERATURE && temperature <= NORMAL_MAX_TEMPERATURE) {
    // If the patient previously had an abnormal alert, clear it now that they have recovered
    if (lastAlertByPatientId.has(patientId)) {
      console.log(
        `[TempAlert] Patient ${patientId} temperature normalized to ${temperature}°C. Clearing alert state.`,
      );
      lastAlertByPatientId.delete(patientId);
    }
    return { alertSent: false, condition: "NORMAL" };
  }

  // 2. Determine abnormal condition
  const condition: "HIGH" | "LOW" =
    temperature > NORMAL_MAX_TEMPERATURE ? "HIGH" : "LOW";

  // 3. Cooldown / Anti-spam check
  const lastAlert = lastAlertByPatientId.get(patientId);
  if (lastAlert) {
    const elapsed = now - lastAlert.alertedAt;
    const sameCondition = lastAlert.type === condition;

    // Throttle notifications if same condition occurred within cooldown window
    if (sameCondition && elapsed < TEMPERATURE_ALERT_COOLDOWN_MS) {
      console.log(
        `[TempAlert] Cooldown active for patient ${patientId} (${condition}: ${temperature}°C). Last alerted ${Math.round(elapsed / 1000)}s ago.`,
      );
      return { alertSent: false, reason: "Cooldown active", condition };
    }
  }

  // 4. Query all connected nonpatients (caregivers)
  const connectedCaregivers = await db.patientNonPatient.findMany({
    where: {
      patientId,
      status: "CONNECTED",
    },
    select: {
      nonPatientId: true,
    },
  });

  if (connectedCaregivers.length === 0) {
    console.log(
      `[TempAlert] Patient ${patientId} has no connected caregivers. Skipping push notification.`,
    );
    return { alertSent: false, reason: "No connected caregivers", condition };
  }

  // 5. Query patient name for personalized notification
  let patientName = "Connected Patient";
  try {
    const patientUser = await db.user.findUnique({
      where: { id: patientId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (patientUser) {
      const full = `${patientUser.firstName ?? ""} ${patientUser.lastName ?? ""}`.trim();
      if (full) {
        patientName = full;
      }
    }
  } catch (err) {
    console.warn("[TempAlert] Failed to fetch patient name:", err);
  }

  // 6. Format alert notification
  const formattedTemp = temperature.toFixed(1);
  const title =
    condition === "HIGH"
      ? `🌡️ High Temperature Alert: ${patientName}`
      : `❄️ Low Temperature Alert: ${patientName}`;

  const body =
    condition === "HIGH"
      ? `${patientName}'s temperature is ${formattedTemp}°C, which is above the normal range (36.0°C - 37.5°C). Please check on them.`
      : `${patientName}'s temperature dropped to ${formattedTemp}°C, which is below the normal range (36.0°C - 37.5°C). Please check on them.`;

  const notificationData = {
    command: "TEMPERATURE_ALERT",
    type: "TEMPERATURE_ALERT",
    alertType: condition === "HIGH" ? "HIGH_TEMPERATURE" : "LOW_TEMPERATURE",
    condition,
    temperature,
    patientId,
    patientName,
    deviceId: deviceId ?? null,
    timestamp: new Date().toISOString(),
  };

  console.log(
    `[TempAlert] Sending ${condition} temperature push notification for patient ${patientId} (${formattedTemp}°C) to ${connectedCaregivers.length} caregiver(s)...`,
  );

  // 7. Send push notifications to connected caregivers via Expo Push & FCM
  try {
    await sendNotificationFn(
      patientId,
      {
        title,
        body,
        channelId: "carelink-alerts",
        data: notificationData,
      },
      connectedCaregivers.map((c) => c.nonPatientId),
    );
  } catch (pushErr) {
    console.error("[TempAlert] Push notification delivery failed:", pushErr);
  }

  // 8. Emit real-time WebSocket alert event so active caregiver sessions receive it instantly
  try {
    emitAlertFn(patientId, {
      ...notificationData,
      id: `temp-${Date.now()}`,
      title,
      body,
      status: "Pending",
      recordedAt: new Date().toISOString(),
    });
  } catch (socketErr) {
    console.error("[TempAlert] Socket alert emission failed:", socketErr);
  }

  // 9. Update alert state in tracking cache
  lastAlertByPatientId.set(patientId, {
    type: condition,
    temperature,
    alertedAt: now,
  });

  return { alertSent: true, condition };
}

/**
 * Clear cooldown cache (helpful for unit testing or manual resets)
 */
export function resetTemperatureAlertCooldown(patientId?: string) {
  if (patientId) {
    lastAlertByPatientId.delete(patientId);
  } else {
    lastAlertByPatientId.clear();
  }
}
