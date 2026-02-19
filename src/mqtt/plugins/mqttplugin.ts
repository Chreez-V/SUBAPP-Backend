import { mqttClient } from "../client.js";

interface driver {
  name: string,
  number_plate: string,
  status: string,
  location: {
    latitude: number,
    longitude: number,
  },
}

export async function startMqtt() {
  let driverHashMap: Map<string, driver> = new Map();

  mqttClient.connect();

  mqttClient.subscribe("subapp/driver", (topic, payload) => {
    const rawPayload = payload.toString("utf-8")
    const data: driver = JSON.parse(rawPayload);

    console.log("received driver data:", topic, data);

    if (data.status === "inactive") {
      console.log("Deleting my friend")
      driverHashMap.delete(data.number_plate)
    }
    else {
      console.log("drivers updated")
      driverHashMap.set(data.number_plate, data)
    }
    try {
      // mqttClient.publish("subapp/passenger", payload.toString());
    } catch (err) {
      console.warn("Could not publish test message", err);
    }
  });
  const intervalId = setInterval(() => {
    if (driverHashMap.size != 0) {
      try {
        const payload = JSON.stringify([...driverHashMap.values()]);
        console.log("sending payload: \n", payload)
        mqttClient.publish("subapp/passenger", payload);

      } catch (err) {
        console.warn("Could not publish test message", err);
      }
    }
  }, 2000);

  // publish a test message after connect
  // setTimeout(() => {
  //   try {
  //     mqttClient.publish("subapp/driver", JSON.stringify({ hello: "world este es un mensaje a enviar" }));
  //   } catch (err) {
  //     console.warn("Could not publish test message", err);
  //   }
  // }, 1000);
}
