import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, createToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { UserRole } from '@prisma/client';

export const authRouter = Router();

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().optional(),
  role: z.nativeEnum(UserRole).optional()
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
  area: z.string().optional(),
  abhaId: z.string().optional(),
  knownAllergies: z.array(z.string()).optional(),
  licenseNumber: z.string().optional(),
  organization: z.string().optional(),
  speciality: z.string().optional()
});

// POST /api/v1/auth/login
authRouter.post('/login', validateBody(loginSchema), async (req, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, role } = req.body;
    const query = emailOrPhone.trim().toLowerCase();

    // Look up by email or phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: 'insensitive' } },
          { phone: { equals: query } }
        ]
      },
      include: { tenant: true }
    });

    // If role provided and no direct match, check if there is a demo user with that role
    if (!user && role) {
      user = await prisma.user.findFirst({
        where: { role },
        include: { tenant: true }
      });
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or user not found' });
      return;
    }

    const token = createToken({
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        area: user.area,
        abhaId: user.abhaId,
        knownAllergies: user.knownAllergies,
        licenseNumber: user.licenseNumber,
        organization: user.organization,
        speciality: user.speciality,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// POST /api/v1/auth/register
authRouter.post('/register', validateBody(registerSchema), async (req, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const email = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      res.status(409).json({ error: 'A user with this email address already exists' });
      return;
    }

    const defaultTenantId = 'pilot-nashik-01';

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        phone: data.phone.trim(),
        passwordHash: 'pbkdf2:user:' + Buffer.from(data.password).toString('base64'),
        role: data.role,
        tenantId: defaultTenantId,
        area: data.area || 'College Road, Nashik',
        abhaId: data.abhaId?.trim() || null,
        knownAllergies: data.knownAllergies || [],
        licenseNumber: data.licenseNumber?.trim() || null,
        organization: data.organization?.trim() || null,
        speciality: data.speciality?.trim() || null,
        isVerified: true
      },
      include: { tenant: true }
    });

    const token = createToken({
      userId: newUser.id,
      role: newUser.role,
      tenantId: newUser.tenantId
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenant.name,
        area: newUser.area,
        abhaId: newUser.abhaId,
        knownAllergies: newUser.knownAllergies,
        licenseNumber: newUser.licenseNumber,
        organization: newUser.organization,
        speciality: newUser.speciality,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { tenant: true }
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      area: user.area,
      abhaId: user.abhaId,
      knownAllergies: user.knownAllergies,
      licenseNumber: user.licenseNumber,
      organization: user.organization,
      speciality: user.speciality,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString().split('T')[0]
    }
  });
});
