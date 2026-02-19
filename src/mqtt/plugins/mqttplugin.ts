import { mqttClient } from "../client.js";

interface MQTTBusPayload {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number;
}

interface driver {
  name: string,
  licenseNumber: string,
  status: string,
  location: {
    latitude: number,
    longitude: number,
  },
}
interface DriverMap {
  [id: string]: driver;
}

async function getActiveDrivers(): Promise<driver[]> {
  const response = await fetch("https://subapp-api.onrender.com/api/conductores/activos");
  let data = await response.json();
  return data.data.map((payload: Partial<driver>) => ({
    name: payload.name,
    licenseNumber: payload.licenseNumber,
    status: payload.status,
    location: {
      latitude: 0,
      longitude: 0,
    }
  })) as driver[]; // Cast the final result to your driver array
}

function createDriverMap(drivers: driver[]): DriverMap {
  const acc: DriverMap = {};
  for (const driver of drivers) {
    // Map the driver object to its license number key
    acc[driver.licenseNumber] = driver;
  }
  return acc;
}

// Example usage: connect and subscribe to a test topic
export async function startMqtt() {
  let drivers = await getActiveDrivers();
  let driverHashMap = createDriverMap(drivers)

  mqttClient.connect();

  mqttClient.subscribe("subapp/driver", (topic, payload) => {
    const rawPayload = payload.toString("utf-8")
    const data: MQTTBusPayload = JSON.parse(rawPayload);

    const driverEntry = Object.values(driverHashMap).find(
      (d) => d.licenseNumber === data.bus_id
    );
    if (driverEntry) {
      console.log("updating location for: ", driverEntry.licenseNumber)
      driverEntry.location = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    } else {
      console.warn(`No driver found with license: ${data.bus_id}`);
    }
    console.log("Data de bus recibida:", topic, driverHashMap[data.bus_id]);
    try {
      // mqttClient.publish("subapp/passenger", payload.toString());
    } catch (err) {
      console.warn("Could not publish test message", err);
    }
  });
  const intervalId = setInterval(() => {
    console.log(driverHashMap);

    // mqttClient.publish("subapp/passenger", driverHashMap);
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
