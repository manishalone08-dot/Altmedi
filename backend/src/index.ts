import { app } from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

const server = app.listen(config.port, () => {
  console.info(`AltMedi API listening on port ${config.port}`);
});

const shutdown = async (signal: string) => {
  console.info(`${signal} received; closing AltMedi API.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
