import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';
import { generateSlug } from '../utils';

const router = Router();

// ================= PUBLIC CONTENT =================

router.get('/profile', (_req: Request, res: Response) => {
  res.json({ profile: db.getState().profile });
});

router.get('/about', (_req: Request, res: Response) => {
  res.json({ about: db.getState().about });
});

router.get('/experience', (_req: Request, res: Response) => {
  const list = [...db.getState().experience].sort((a, b) => a.order - b.order);
  res.json({ experience: list });
});

router.get('/education', (_req: Request, res: Response) => {
  const list = [...db.getState().education].sort((a, b) => a.order - b.order);
  res.json({ education: list });
});

router.get('/skills', (_req: Request, res: Response) => {
  const list = [...db.getState().skills].sort((a, b) => a.order - b.order);
  res.json({ skills: list });
});

router.get('/services', (_req: Request, res: Response) => {
  const list = [...db.getState().services].filter(s => s.active).sort((a, b) => a.order - b.order);
  res.json({ services: list });
});

router.get('/testimonials', (_req: Request, res: Response) => {
  const list = [...db.getState().testimonials].filter(t => t.active).sort((a, b) => a.order - b.order);
  res.json({ testimonials: list });
});

router.get('/resume', (_req: Request, res: Response) => {
  res.json({ resume: db.getState().resume });
});

router.get('/pages/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = db.getState().customPages.find(p => p.slug === slug);
  if (!page || !page.visible) {
    res.status(404).json({ error: 'Page not found or private.' });
    return;
  }
  res.json({ page });
});

// ================= ADMIN DASHBOARD OVERVIEW =================

router.get('/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const state = db.getState();
  const publishedProjects = state.projects.filter(p => p.published).length;
  const draftProjects = state.projects.length - publishedProjects;
  const unreadMessages = state.contactMessages.filter(m => !m.read).length;
  const totalMedia = state.media.length;
  const mediaStorageBytes = state.media.reduce((acc, curr) => acc + (curr.size || 0), 0);

  res.json({
    stats: {
      totalProjects: state.projects.length,
      publishedProjects,
      draftProjects,
      totalMedia,
      mediaStorageBytes,
      totalMessages: state.contactMessages.length,
      unreadMessages,
      servicesCount: state.services.length,
      skillsCount: state.skills.length,
      customPagesCount: state.customPages.length,
    },
    recentProjects: state.projects.slice(0, 5),
    recentMessages: state.contactMessages.slice(0, 5),
  });
});

// ================= ADMIN EDITORS =================

// Profile
router.put('/admin/profile', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    await db.updateState(state => {
      state.profile = { ...state.profile, ...updates };
    });
    res.json({ success: true, profile: db.getState().profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// About Page
router.put('/admin/about', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    await db.updateState(state => {
      state.about = { ...state.about, ...updates };
    });
    res.json({ success: true, about: db.getState().about });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update about data.' });
  }
});

// Experience CRUD
router.post('/admin/experience', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      id: `exp_${Date.now().toString(36)}`,
      ...req.body,
      order: db.getState().experience.length + 1,
    };
    await db.updateState(s => { s.experience.push(item); });
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/experience/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;
    await db.updateState(s => {
      const idx = s.experience.findIndex(e => e.id === id);
      if (idx !== -1) {
        s.experience[idx] = { ...s.experience[idx], ...req.body };
        updated = s.experience[idx];
      }
    });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/experience/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.experience = s.experience.filter(e => e.id !== id);
    });
    res.json({ success: true, message: 'Experience item deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Education CRUD
router.post('/admin/education', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      id: `edu_${Date.now().toString(36)}`,
      ...req.body,
      order: db.getState().education.length + 1,
    };
    await db.updateState(s => { s.education.push(item); });
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/education/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;
    await db.updateState(s => {
      const idx = s.education.findIndex(e => e.id === id);
      if (idx !== -1) {
        s.education[idx] = { ...s.education[idx], ...req.body };
        updated = s.education[idx];
      }
    });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/education/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.education = s.education.filter(e => e.id !== id);
    });
    res.json({ success: true, message: 'Education item deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Skills CRUD
router.get('/admin/skills', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ skills: db.getState().skills });
});

router.post('/admin/skills', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      id: `sk_${Date.now().toString(36)}`,
      ...req.body,
      order: db.getState().skills.length + 1,
    };
    await db.updateState(s => { s.skills.push(item); });
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/skills/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;
    await db.updateState(s => {
      const idx = s.skills.findIndex(sk => sk.id === id);
      if (idx !== -1) {
        s.skills[idx] = { ...s.skills[idx], ...req.body };
        updated = s.skills[idx];
      }
    });
    if (!updated) return res.status(404).json({ error: 'Skill not found' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/skills/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.skills = s.skills.filter(sk => sk.id !== id);
    });
    res.json({ success: true, message: 'Skill deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Services CRUD
router.get('/admin/services', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ services: db.getState().services });
});

router.post('/admin/services', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      id: `srv_${Date.now().toString(36)}`,
      ...req.body,
      order: db.getState().services.length + 1,
    };
    await db.updateState(s => { s.services.push(item); });
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/services/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;
    await db.updateState(s => {
      const idx = s.services.findIndex(srv => srv.id === id);
      if (idx !== -1) {
        s.services[idx] = { ...s.services[idx], ...req.body };
        updated = s.services[idx];
      }
    });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/services/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.services = s.services.filter(srv => srv.id !== id);
    });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Testimonials CRUD
router.get('/admin/testimonials', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ testimonials: db.getState().testimonials });
});

router.post('/admin/testimonials', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      id: `t_${Date.now().toString(36)}`,
      ...req.body,
      order: db.getState().testimonials.length + 1,
    };
    await db.updateState(s => { s.testimonials.push(item); });
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/testimonials/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;
    await db.updateState(s => {
      const idx = s.testimonials.findIndex(t => t.id === id);
      if (idx !== -1) {
        s.testimonials[idx] = { ...s.testimonials[idx], ...req.body };
        updated = s.testimonials[idx];
      }
    });
    if (!updated) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/testimonials/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.testimonials = s.testimonials.filter(t => t.id !== id);
    });
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resume
router.put('/admin/resume', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    await db.updateState(state => {
      state.resume = { ...state.resume, ...updates, updatedAt: new Date().toISOString() };
    });
    res.json({ success: true, resume: db.getState().resume });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Custom Pages
router.get('/admin/pages', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ pages: db.getState().customPages });
});

router.post('/admin/pages', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, slug, inNavigation, visible, blocks, featuredImage, seoTitle, seoDescription } = req.body;
    const finalSlug = slug ? generateSlug(slug) : generateSlug(title || 'custom-page');
    const page = {
      id: `pg_${Date.now().toString(36)}`,
      title: title || 'Untitled Page',
      slug: finalSlug,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || '',
      featuredImage: featuredImage || '',
      visible: Boolean(visible),
      inNavigation: Boolean(inNavigation),
      blocks: Array.isArray(blocks) ? blocks : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.updateState(s => {
      s.customPages.push(page);
      if (page.inNavigation) {
        s.navigation.push({
          id: `nav_${page.id}`,
          label: page.title,
          path: `/pages/${page.slug}`,
          visible: true,
          order: s.navigation.length + 1,
          isCustom: true,
        });
      }
    });

    res.status(201).json({ success: true, page });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/pages/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updatedPage: any = null;

    await db.updateState(s => {
      const idx = s.customPages.findIndex(p => p.id === id);
      if (idx !== -1) {
        const current = s.customPages[idx];
        const slug = req.body.slug ? generateSlug(req.body.slug) : current.slug;
        s.customPages[idx] = {
          ...current,
          ...req.body,
          slug,
          updatedAt: new Date().toISOString(),
        };
        updatedPage = s.customPages[idx];

        // sync nav
        const navItem = s.navigation.find(n => n.id === `nav_${id}`);
        if (navItem) {
          navItem.label = updatedPage.title;
          navItem.path = `/pages/${updatedPage.slug}`;
          navItem.visible = updatedPage.inNavigation && updatedPage.visible;
        } else if (updatedPage.inNavigation) {
          s.navigation.push({
            id: `nav_${id}`,
            label: updatedPage.title,
            path: `/pages/${updatedPage.slug}`,
            visible: updatedPage.visible,
            order: s.navigation.length + 1,
            isCustom: true,
          });
        }
      }
    });

    if (!updatedPage) return res.status(404).json({ error: 'Page not found' });
    res.json({ success: true, page: updatedPage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/pages/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(s => {
      s.customPages = s.customPages.filter(p => p.id !== id);
      s.navigation = s.navigation.filter(n => n.id !== `nav_${id}`);
    });
    res.json({ success: true, message: 'Custom page deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
