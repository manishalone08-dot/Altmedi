import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from './config';
import { prisma } from './lib/prisma';

export const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: config.clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type']
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/v1/health', async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

// The error payload intentionally omits database and stack details.
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (config.nodeEnv !== 'test') {
    console.error(error);
  }
  response.status(503).json({ error: 'Service temporarily unavailable' });
});
