import 'dotenv/config';

const requireEnvironment = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be a valid TCP port.');
  }
  return port;
};

export const config = {
  databaseUrl: requireEnvironment('DATABASE_URL'),
  port: parsePort(process.env.API_PORT),
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development'
} as const;
