import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// Public settings & navigation
router.get('/settings', (_req: Request, res: Response) => {
  try {
    const state = db.getState();
    const visibleNav = state.navigation
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);

    const visibleSocial = state.socialLinks.filter(s => s.visible);

    res.json({
      settings: state.settings,
      navigation: visibleNav,
      socialLinks: visibleSocial,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch settings.' });
  }
});

// Admin settings
router.get('/admin/settings', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const state = db.getState();
  res.json({
    settings: state.settings,
    navigation: state.navigation,
    socialLinks: state.socialLinks,
  });
});

router.put('/admin/settings', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    await db.updateState(state => {
      state.settings = { ...state.settings, ...updates };
    });
    res.json({ success: true, settings: db.getState().settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings.' });
  }
});

router.put('/admin/navigation', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Navigation items must be an array.' });
      return;
    }

    await db.updateState(state => {
      state.navigation = items;
    });

    res.json({ success: true, navigation: db.getState().navigation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update navigation.' });
  }
});

router.put('/admin/social', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links)) {
      res.status(400).json({ error: 'Social links must be an array.' });
      return;
    }

    await db.updateState(state => {
      state.socialLinks = links;
    });

    res.json({ success: true, socialLinks: db.getState().socialLinks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update social links.' });
  }
});

export default router;
