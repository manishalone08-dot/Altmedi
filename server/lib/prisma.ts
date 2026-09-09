import { PrismaClient } from '@prisma/client';

declare global {
  // Keep a single connection pool while the API process is hot-reloaded locally.
  // eslint-disable-next-line no-var
  var altMediPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.altMediPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.altMediPrisma = prisma;
}
