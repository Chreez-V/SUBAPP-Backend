import { mqttClient } from "../client";

// Example usage: connect and subscribe to a test topic
export async function startMqtt() {
  mqttClient.connect();

  mqttClient.subscribe("subapp/driver", (topic, payload) => {
    console.log("Data de bus recibida:", topic, payload.toString());
    try {
      mqttClient.publish("subapp/passenger", payload.toString());
    } catch (err) {
      console.warn("Could not publish test message", err);
    }
  });

  // publish a test message after connect
  /*setTimeout(() => {
    try {
      mqttClient.publish("subapp/driver", JSON.stringify({ hello: "world este es un mensaje a enviar" }));
    } catch (err) {
      console.warn("Could not publish test message", err);
    }
  }, 1000);*/
}
