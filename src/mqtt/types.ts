export type MessageHandler = (topic: string, payload: Buffer) => void;

export interface MqttClientOptions {
  brokerUrl?: string; // e.g. mqtt://localhost:1883
  clientId?: string;
  username?: string;
  password?: string;
  connectOptions?: Record<string, unknown>;
}
