import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { MqttClientOptions, MessageHandler } from "./types.js";

class MQTTClient {
  private client?: MqttClient;
  private connected = false;

  connect(options?: MqttClientOptions) {
    const brokerUrl = options?.brokerUrl || process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
    const clientId = options?.clientId || process.env.MQTT_CLIENT_ID || `subapp_${Math.random().toString(16).slice(2, 8)}`;

    const connectOpts: IClientOptions = {
      clientId,
      username: options?.username || process.env.MQTT_USERNAME,
      password: options?.password || process.env.MQTT_PASSWORD,
      ...(options?.connectOptions || {}),
    } as IClientOptions;

    this.client = mqtt.connect(brokerUrl, connectOpts);

    this.client.on("connect", () => {
      this.connected = true;
      console.info("MQTT connected", { brokerUrl, clientId });
    });

    this.client.on("reconnect", () => {
      console.info("MQTT reconnecting...");
    });

    this.client.on("close", () => {
      this.connected = false;
      console.info("MQTT connection closed");
    });

    this.client.on("error", (err) => {
      console.error("MQTT error:", err.message || err);
    });

    return this.client;
  }

  disconnect(force = false) {
    if (!this.client) return;
    this.client.end(force, () => {
      this.connected = false;
    });
  }

  publish(topic: string, message: string | Buffer, options?: mqtt.IClientPublishOptions) {
    if (!this.client) throw new Error("MQTT client is not connected");
    this.client.publish(topic, message);
  }

  subscribe(topic: string | string[], handler?: MessageHandler, options?: mqtt.IClientSubscribeOptions) {
    if (!this.client) throw new Error("MQTT client is not connected");

    this.client.subscribe(topic, (err, granted) => {
      if (err) {
        console.error("MQTT subscribe error", err.message || err);
        return;
      }
    });

    if (handler) {
      this.client.on("message", (tpc, payload) => {
        try {
          handler(tpc, payload);
        } catch (err) {
          console.error("MQTT handler error", err);
        }
      });
    }
  }

  on(event: string, cb: (...args: any[]) => void) {
    this.client?.on(event as any, cb);
  }

  isConnected() {
    return this.connected;
  }

  getClient() {
    return this.client;
  }
}

export const mqttClient = new MQTTClient();

export default mqttClient;
