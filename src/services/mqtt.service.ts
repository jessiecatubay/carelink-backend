import mqtt from "mqtt";

// =====================================================
// MQTT CONFIGURATION
// =====================================================

// HiveMQ Cloud TLS MQTT URL
const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || "";

// HiveMQ Cloud credentials
const MQTT_USERNAME =
  process.env.MQTT_USERNAME;

const MQTT_PASSWORD =
  process.env.MQTT_PASSWORD;


// =====================================================
// MQTT CLIENT
// =====================================================

const mqttClient = mqtt.connect(
  MQTT_BROKER_URL,
  {
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
  }
);


// =====================================================
// MQTT CONNECTED
// =====================================================

mqttClient.on("connect", () => {

  console.log(
    "================================="
  );

  console.log(
    "MQTT connected to HiveMQ Cloud"
  );

  console.log(
    "Broker:",
    MQTT_BROKER_URL
  );

  console.log(
    "TLS: Enabled"
  );

  console.log(
    "================================="
  );

});


// =====================================================
// MQTT ERROR
// =====================================================

mqttClient.on("error", (error) => {

  console.error(
    "MQTT error:",
    error.message
  );

});


// =====================================================
// MQTT RECONNECT
// =====================================================

mqttClient.on("reconnect", () => {

  console.log(
    "MQTT reconnecting..."
  );

});


// =====================================================
// MQTT OFFLINE
// =====================================================

mqttClient.on("offline", () => {

  console.log(
    "MQTT client is offline."
  );

});


// =====================================================
// MQTT CLOSE
// =====================================================

mqttClient.on("close", () => {

  console.log(
    "MQTT connection closed."
  );

});


// =====================================================
// SEND DEVICE COMMAND
// =====================================================

export function SendDeviceCommand(
  deviceId: string,
  command: string
) {

  // ---------------------------------------------------
  // MQTT topic
  // ---------------------------------------------------

  const topic =
    `carelink/device/${deviceId}/commands`;


  // ---------------------------------------------------
  // MQTT message
  // ---------------------------------------------------

  const message =
    JSON.stringify({
      command,
    });


  // ---------------------------------------------------
  // Make sure MQTT is connected
  // ---------------------------------------------------

  if (!mqttClient.connected) {

    console.error(
      "MQTT is not connected."
    );

    console.error(
      "Command was not sent."
    );

    return;

  }


  // ---------------------------------------------------
  // Publish
  // ---------------------------------------------------

  mqttClient.publish(
    topic,
    message,
    (error) => {

      if (error) {

        console.error(
          "MQTT publish error:",
          error
        );

        return;

      }


      console.log(
        "================================="
      );

      console.log(
        "MQTT command sent"
      );

      console.log(
        "Device ID:",
        deviceId
      );

      console.log(
        "Topic:",
        topic
      );

      console.log(
        "Message:",
        message
      );

      console.log(
        "================================="
      );

    }
  );

}
