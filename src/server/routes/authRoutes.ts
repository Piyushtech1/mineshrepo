import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  verifyPassword,
  hashPassword,
  requireAdmin,
  AuthenticatedRequest,
} from '../auth';

const router = Router();

// Rate limiting & failed attempt tracker
let failedAttempts = 0;
let lockoutUntil = 0;

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (Date.now() < lockoutUntil) {
      const waitSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      res.status(429).json({
        error: `Too many failed attempts. Login is locked for ${waitSeconds} seconds.`,
      });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const admin = db.getState().admin;
    const emailMatch = admin.email.toLowerCase() === email.trim().toLowerCase();
    const passwordMatch = emailMatch ? await verifyPassword(password, admin.passwordHash) : false;

    if (!emailMatch || !passwordMatch) {
      failedAttempts += 1;
      if (failedAttempts >= 5) {
        lockoutUntil = Date.now() + 60 * 1000; // 1 minute lockout
        failedAttempts = 0;
        res.status(429).json({
          error: 'Too many incorrect login attempts. Account temporarily locked for 60 seconds.',
        });
        return;
      }
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    // Reset attempts on successful login
    failedAttempts = 0;
    lockoutUntil = 0;

    await db.updateState(state => {
      state.admin.lastLoginAt = new Date().toISOString();
    });

    const token = generateToken(admin);
    setAuthCookie(res, token);

    const { passwordHash, ...safeAdmin } = admin;
    res.json({
      success: true,
      message: 'Authentication successful.',
      admin: safeAdmin,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error during login.' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ admin: req.admin });
});

router.post('/change-password', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const admin = db.getState().admin;
    const isMatch = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await db.updateState(state => {
      state.admin.passwordHash = newHash;
    });

    res.json({ success: true, message: 'Admin password successfully updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to change password.' });
  }
});

router.post('/update-profile', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }

    await db.updateState(state => {
      state.admin.name = name.trim();
      state.admin.email = email.trim().toLowerCase();
    });

    const { passwordHash, ...safeAdmin } = db.getState().admin;
    res.json({ success: true, admin: safeAdmin, message: 'Admin credentials updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update admin profile.' });
  }
});

export default router;
