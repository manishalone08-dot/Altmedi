import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { config } from './config';
import { prisma } from './lib/prisma';
import { authRouter } from './routes/auth.routes';
import { medicinesRouter } from './routes/medicines.routes';
import { vendorsRouter } from './routes/vendors.routes';
import { reviewsRouter } from './routes/reviews.routes';
import { governanceRouter } from './routes/governance.routes';
import { prescriptionsRouter } from './routes/prescriptions.routes';

import { notificationsRouter } from './routes/notifications.routes';

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

// Health Check
app.get('/api/v1/health', async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

// Domain Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/medicines', medicinesRouter);
app.use('/api/v1/vendors', vendorsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/governance', governanceRouter);
app.use('/api/v1/prescriptions', prescriptionsRouter);
app.use('/api/v1/notifications', notificationsRouter);

// 404 handler
app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (config.nodeEnv !== 'test') {
    console.error('Server error:', error);
  }
  response.status(500).json({ error: 'Internal server error' });
});
