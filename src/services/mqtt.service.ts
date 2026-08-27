import mqtt from "mqtt";

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://192.168.16.122:1883";

const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on("connect", () => {
  console.log("MQTT connected to Mosquitto"); 
});

mqttClient.on("error", (error) => {
  console.error("MQTT error:", error);
});

mqttClient.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});

export function SendDeviceCommand(
  deviceId: string,
  command: string
) {
  const topic = `carelink/device/${deviceId}/commands`;

  const message = JSON.stringify({
    command,
  });

  mqttClient.publish(topic, message, (error) => {
    if (error) {
      console.error("MQTT publish error:", error);
      return;
    }

    console.log("MQTT command sent");
    console.log("Topic:", topic);
    console.log("Message:", message);
  });
}