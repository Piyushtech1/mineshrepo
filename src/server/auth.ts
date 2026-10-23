import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db/store';
import { AdminUser } from './db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'aura_portfolio_super_secure_jwt_secret_change_in_production';
export const AUTH_COOKIE_NAME = 'aura_admin_token';

export interface AuthenticatedRequest extends Request {
  admin?: Omit<AdminUser, 'passwordHash'>;
}

export function generateToken(admin: AdminUser): string {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    // Also allow Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized. Authentication token is missing.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; name: string };
    const currentAdmin = db.getState().admin;

    if (currentAdmin.id !== decoded.sub) {
      res.status(401).json({ error: 'Unauthorized. Invalid session or user revoked.' });
      return;
    }

    // Attach sanitized admin object
    const { passwordHash, ...safeAdmin } = currentAdmin;
    req.admin = safeAdmin;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized. Session expired or token invalid.' });
  }
}
