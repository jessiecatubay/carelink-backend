import { commandValueSchema } from "@/schemas/device.schema";
import mqtt from "mqtt";

// =====================================================
// MQTT CONFIGURATION
// =====================================================

// HiveMQ Cloud TLS MQTT URL
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "";

// HiveMQ Cloud credentials
const MQTT_USERNAME = process.env.MQTT_USERNAME;

const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

// =====================================================
// MQTT CLIENT
// =====================================================

const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,

  // HiveMQ Cloud uses TLS
  protocol: "mqtts",

  // Automatically reconnect every 5 seconds
  reconnectPeriod: 5000,

  // Connection timeout
  connectTimeout: 10000,

  // Keep connection alive
  keepalive: 60,

  // Start a clean MQTT session
  clean: true,
});

// =====================================================
// MQTT CONNECTED
// =====================================================

mqttClient.on("connect", () => {
  console.log("=================================");

  console.log("MQTT connected to HiveMQ Cloud");

  console.log("Broker:", MQTT_BROKER_URL);

  console.log("TLS: Enabled");

  console.log("=================================");
});

// =====================================================
// MQTT ERROR
// =====================================================

mqttClient.on("error", (error) => {
  console.error("MQTT error:", error.message);
});

// =====================================================
// MQTT RECONNECT
// =====================================================

mqttClient.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});

// =====================================================
// MQTT OFFLINE
// =====================================================

mqttClient.on("offline", () => {
  console.log("MQTT client is offline.");
});

// =====================================================
// MQTT CLOSE
// =====================================================

mqttClient.on("close", () => {
  console.log("MQTT connection closed.");
});

// =====================================================
// SEND DEVICE COMMAND
// =====================================================

export function SendDeviceCommand(
  deviceId: string,
  command: string,
  patientId: string,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    deviceId: string;
    command: "FOOD" | "WATER" | "ASSISTANCE" | "EMERGENCY";
  };
}> {
  const parsedCommand = commandValueSchema.safeParse(command.toUpperCase());
  if (!parsedCommand.success || parsedCommand.data === "SATISFIED") {
    return Promise.resolve({
      success: false,
      message: "Invalid device command",
    });
  }

  const mqttCommand = parsedCommand.data as
    | "FOOD"
    | "WATER"
    | "ASSISTANCE"
    | "EMERGENCY";

  // ---------------------------------------------------
  // MQTT topic
  // ---------------------------------------------------

  const topic = `carelink/device/${deviceId}/commands`;

  // ---------------------------------------------------
  // MQTT message
  // ---------------------------------------------------

  const message = JSON.stringify({
    command: mqttCommand,
  });

  // ---------------------------------------------------
  // Make sure MQTT is connected
  // ---------------------------------------------------

  if (!mqttClient.connected) {
    console.error("MQTT is not connected.");

    console.error("Command was not sent.");

    return Promise.resolve({
      success: false,
      message: "MQTT is not connected",
    });
  }

  // ---------------------------------------------------
  // Publish
  // ---------------------------------------------------

  return new Promise((resolve) => {
    mqttClient.publish(topic, message, (error) => {
      if (error) {
        console.error("MQTT publish error:", error.message);
        resolve({ success: false, message: "Unable to send command" });
        return;
      }

      resolve({
        success: true,
        message: "Command sent",
        data: { deviceId, command: mqttCommand },
      });
    });
  });
}
