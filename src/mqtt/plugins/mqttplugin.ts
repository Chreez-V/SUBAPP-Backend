import { mqttClient } from "../client.js";

interface driver {
  name: string,
  number_plate: string,
  status: string,
  location: {
    latitude: number,
    longitude: number,
  },
  last_update: number
}


export async function startMqtt() {
  let driverHashMap: Map<string, driver> = new Map();

  mqttClient.connect();

  const cleanupInactiveDrivers = () => {
    const now = Date.now();
    const threshold = 20 * 1000; // 20 seconds in milliseconds

    for (const [id, data] of driverHashMap.entries()) {
      if (now - data.last_update > threshold) {
        driverHashMap.delete(id);
        console.log(`Driver ${data.number_plate} removed due to inactivity.`);
      }
    }
  };

  mqttClient.subscribe("subapp/driver", (topic, payload) => {
    const rawPayload = payload.toString("utf-8")
    const data: driver = JSON.parse(rawPayload);

    data.last_update = Date.now();
    console.log("received driver data:", topic, data);

    if (data.status === "inactive") {
      const payload = JSON.stringify([...driverHashMap.values()]);
      // console.log("Deleting my friend")
      driverHashMap.delete(data.number_plate)
      console.log("updated active buses: ")
      mqttClient.publish("subapp/passenger", payload);
    }
    else {
      console.log("drivers updated")
      driverHashMap.set(data.number_plate, data)
    }
  });
  const intervalId = setInterval(() => {
    if (driverHashMap.size != 0) {
      cleanupInactiveDrivers()
      try {
        const payload = JSON.stringify([...driverHashMap.values()]);
        console.log("sending payload: \n", payload)
        mqttClient.publish("subapp/passenger", payload);

      } catch (err) {
        console.warn("Could not publish test message", err);
      }
    }
  }, 5000);

  // publish a test message after connect
  // setTimeout(() => {
  //   try {
  //     mqttClient.publish("subapp/driver", JSON.stringify({ hello: "world este es un mensaje a enviar" }));
  //   } catch (err) {
  //     console.warn("Could not publish test message", err);
  //   }
  // }, 1000);
}
