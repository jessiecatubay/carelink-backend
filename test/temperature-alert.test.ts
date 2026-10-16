import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";
import {
  checkAndSendTemperatureAlert,
  normalizeTemperatureToCelsius,
  resetTemperatureAlertCooldown,
  NORMAL_MIN_TEMPERATURE,
  NORMAL_MAX_TEMPERATURE,
  MIN_PLAUSIBLE_SKIN_TEMPERATURE,
} from "@/services/temperature-alert.service";

beforeEach(() => {
  resetTemperatureAlertCooldown();
});

test("constants match CareLink clinical rules", () => {
  assert.equal(NORMAL_MIN_TEMPERATURE, 36.0);
  assert.equal(NORMAL_MAX_TEMPERATURE, 37.5);
  assert.equal(MIN_PLAUSIBLE_SKIN_TEMPERATURE, 25.0);
});

test("normalizeTemperatureToCelsius converts Fahrenheit (> 60) to Celsius and preserves Celsius", () => {
  // 98.6°F -> 37.0°C
  const c1 = normalizeTemperatureToCelsius(98.6);
  assert.equal(Math.round(c1 * 10) / 10, 37.0);

  // 100.4°F -> 38.0°C
  const c2 = normalizeTemperatureToCelsius(100.4);
  assert.equal(Math.round(c2 * 10) / 10, 38.0);

  // 36.8°C remains 36.8°C
  const c3 = normalizeTemperatureToCelsius(36.8);
  assert.equal(c3, 36.8);
});

test("normal temperature (36.0°C - 37.5°C) does NOT send a push notification", async () => {
  const result = await checkAndSendTemperatureAlert({
    patientId: "patient-1",
    temperature: 36.8,
    sensorContact: true,
  });

  assert.equal(result.alertSent, false);
  assert.equal(result.condition, "NORMAL");
});

test("invalid readings (sensorContact: false or temp < 25°C) are ignored to avoid false alarms", async () => {
  // Sensor not touching skin
  const resOffSkin = await checkAndSendTemperatureAlert({
    patientId: "patient-1",
    temperature: 34.0,
    sensorContact: false,
  });
  assert.equal(resOffSkin.alertSent, false);
  assert.equal(resOffSkin.condition, "INVALID");

  // Ambient room temperature reading (e.g. 21°C)
  const resAmbient = await checkAndSendTemperatureAlert({
    patientId: "patient-1",
    temperature: 21.5,
    sensorContact: true,
  });
  assert.equal(resAmbient.alertSent, false);
  assert.equal(resAmbient.condition, "INVALID");
});

test("high temperature (> 37.5°C) sends high temperature push notification to connected nonpatients", async () => {
  let pushCalledWith: any = null;
  let socketCalledWith: any = null;

  const mockDb = {
    patientNonPatient: {
      findMany: async () => [{ nonPatientId: "caregiver-1" }, { nonPatientId: "caregiver-2" }],
    },
    user: {
      findUnique: async () => ({ firstName: "Juan", lastName: "Dela Cruz" }),
    },
  } as any;

  const mockSendNotification = async (patientId: string, notification: any, nonPatientIds: string[]) => {
    pushCalledWith = { patientId, notification, nonPatientIds };
    return true;
  };

  const mockEmitAlert = (_patientId: string, payload: any) => {
    socketCalledWith = payload;
  };

  const result = await checkAndSendTemperatureAlert({
    patientId: "patient-1",
    temperature: 38.6,
    sensorContact: true,
    deviceId: "device-xyz",
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });

  assert.equal(result.alertSent, true);
  assert.equal(result.condition, "HIGH");

  // Verify push notification contents
  assert.ok(pushCalledWith);
  assert.equal(pushCalledWith.notification.title.includes("High Temperature Alert"), true);
  assert.equal(pushCalledWith.notification.title.includes("Juan Dela Cruz"), true);
  assert.equal(pushCalledWith.notification.body.includes("38.6°C"), true);
  assert.equal(pushCalledWith.notification.body.includes("above the normal range"), true);
  assert.equal(pushCalledWith.notification.data.condition, "HIGH");
  assert.equal(pushCalledWith.notification.data.alertType, "HIGH_TEMPERATURE");
  assert.deepEqual(pushCalledWith.nonPatientIds, ["caregiver-1", "caregiver-2"]);

  // Verify real-time socket alert
  assert.ok(socketCalledWith);
  assert.equal(socketCalledWith.alertType, "HIGH_TEMPERATURE");
});

test("low temperature (< 36.0°C and >= 25.0°C) sends low temperature push notification", async () => {
  let pushCalledWith: any = null;

  const mockDb = {
    patientNonPatient: {
      findMany: async () => [{ nonPatientId: "caregiver-1" }],
    },
    user: {
      findUnique: async () => ({ firstName: "Maria", lastName: "Santos" }),
    },
  } as any;

  const mockSendNotification = async (patientId: string, notification: any, nonPatientIds: string[]) => {
    pushCalledWith = { patientId, notification, nonPatientIds };
    return true;
  };

  const mockEmitAlert = () => {};

  const result = await checkAndSendTemperatureAlert({
    patientId: "patient-2",
    temperature: 35.2,
    sensorContact: true,
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });

  assert.equal(result.alertSent, true);
  assert.equal(result.condition, "LOW");

  assert.ok(pushCalledWith);
  assert.equal(pushCalledWith.notification.title.includes("Low Temperature Alert"), true);
  assert.equal(pushCalledWith.notification.title.includes("Maria Santos"), true);
  assert.equal(pushCalledWith.notification.body.includes("35.2°C"), true);
  assert.equal(pushCalledWith.notification.body.includes("below the normal range"), true);
  assert.equal(pushCalledWith.notification.data.condition, "LOW");
  assert.equal(pushCalledWith.notification.data.alertType, "LOW_TEMPERATURE");
});

test("anti-spam cooldown suppresses duplicate push notifications within 5 minutes", async () => {
  let pushCallCount = 0;

  const mockDb = {
    patientNonPatient: {
      findMany: async () => [{ nonPatientId: "caregiver-1" }],
    },
    user: {
      findUnique: async () => ({ firstName: "Test", lastName: "Patient" }),
    },
  } as any;

  const mockSendNotification = async () => {
    pushCallCount++;
    return true;
  };
  const mockEmitAlert = () => {};

  // 1st reading (fever onset): triggers alert
  const res1 = await checkAndSendTemperatureAlert({
    patientId: "patient-cooldown",
    temperature: 38.5,
    sensorContact: true,
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });
  assert.equal(res1.alertSent, true);
  assert.equal(pushCallCount, 1);

  // 2nd reading 10 seconds later: should be suppressed by cooldown
  const res2 = await checkAndSendTemperatureAlert({
    patientId: "patient-cooldown",
    temperature: 38.7,
    sensorContact: true,
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });
  assert.equal(res2.alertSent, false);
  assert.equal(res2.reason, "Cooldown active");
  assert.equal(pushCallCount, 1);

  // 3rd reading: temperature returns to normal
  const resNormal = await checkAndSendTemperatureAlert({
    patientId: "patient-cooldown",
    temperature: 36.8,
    sensorContact: true,
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });
  assert.equal(resNormal.condition, "NORMAL");

  // 4th reading: temperature spikes again -> should alert immediately because it normalized before!
  const resSpikeAgain = await checkAndSendTemperatureAlert({
    patientId: "patient-cooldown",
    temperature: 38.9,
    sensorContact: true,
    db: mockDb,
    sendNotificationFn: mockSendNotification as any,
    emitAlertFn: mockEmitAlert as any,
  });
  assert.equal(resSpikeAgain.alertSent, true);
  assert.equal(pushCallCount, 2);
});
