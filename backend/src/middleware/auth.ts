import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  tenantId: string;
  organization?: string | null;
  licenseNumber?: string | null;
  speciality?: string | null;
  abhaId?: string | null;
  knownAllergies: string[];
  area?: string | null;
  isVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const getSecret = (): string => process.env.SESSION_SECRET || 'altmedi-default-secret-change-in-prod';

// Simple, self-contained HMAC-SHA256 token encoding/decoding without external dependencies
export const createToken = (payload: { userId: string; role: string; tenantId: string }): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
};

export const verifyToken = (token: string): { userId: string; role: string; tenantId: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decoded;
  } catch {
    return null;
  }
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found or deactivated' });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      organization: user.organization,
      licenseNumber: user.licenseNumber,
      speciality: user.speciality,
      abhaId: user.abhaId,
      knownAllergies: user.knownAllergies,
      area: user.area,
      isVerified: user.isVerified
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return next();

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        organization: user.organization,
        licenseNumber: user.licenseNumber,
        speciality: user.speciality,
        abhaId: user.abhaId,
        knownAllergies: user.knownAllergies,
        area: user.area,
        isVerified: user.isVerified
      };
    }
  } catch {
    // Ignore optional auth error
  }
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: role '${req.user.role}' is not authorized to perform this operation.`
      });
      return;
    }

    next();
  };
};
