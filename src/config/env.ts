export const envSchema = {
  type: 'object',
  required: ['MONGODB_URL'],
  properties: {
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    MONGODB_URL: {
      type: 'string',
    },
    PORT: {
      type: 'number',
    },
    HOST: {
      type: 'string',
    }
  }
} as const;

export type EnvConfig = typeof envSchema;
