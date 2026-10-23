import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';
import { generateSlug, filterAndSortProjects } from '../utils';
import { Project } from '../db/schema';

const router = Router();

// ================= PUBLIC ROUTES =================

router.get('/projects', (req: Request, res: Response) => {
  try {
    const { category, search, tag, featured, sort } = req.query;
    const allProjects = db.getState().projects;

    const filtered = filterAndSortProjects(allProjects, {
      category: category as string,
      search: search as string,
      tag: tag as string,
      featuredOnly: featured === 'true',
      publishedOnly: true,
      sort: sort as any,
    });

    res.json({
      projects: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects.' });
  }
});

router.get('/projects/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const allProjects = db.getState().projects;
    const projectIndex = allProjects.findIndex(p => p.slug === slug || p.id === slug);

    if (projectIndex === -1) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const project = allProjects[projectIndex];
    if (!project.published) {
      // Check if admin is requesting
      // If not published and not verified, return 404
      const token = req.cookies?.aura_admin_token || req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status(404).json({ error: 'Project not found or unpublished.' });
        return;
      }
    }

    // Find previous and next published projects
    const published = allProjects.filter(p => p.published).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const currentIndex = published.findIndex(p => p.id === project.id);
    const prevProject = currentIndex > 0 ? {
      id: published[currentIndex - 1].id,
      title: published[currentIndex - 1].title,
      slug: published[currentIndex - 1].slug,
      coverImage: published[currentIndex - 1].coverImage,
    } : null;
    const nextProject = currentIndex < published.length - 1 ? {
      id: published[currentIndex + 1].id,
      title: published[currentIndex + 1].title,
      slug: published[currentIndex + 1].slug,
      coverImage: published[currentIndex + 1].coverImage,
    } : null;

    // Find related projects in same category
    const related = published
      .filter(p => p.id !== project.id && p.categorySlug === project.categorySlug)
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        categoryName: p.categoryName,
        coverImage: p.coverImage,
        year: p.year,
      }));

    res.json({
      project,
      prevProject,
      nextProject,
      related,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project.' });
  }
});

// ================= ADMIN ROUTES =================

router.get('/admin/projects', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = db.getState().projects;
    const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({
      projects: sorted,
      total: sorted.length,
      publishedCount: sorted.filter(p => p.published).length,
      draftCount: sorted.filter(p => !p.published).length,
      featuredCount: sorted.filter(p => p.featured).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin projects.' });
  }
});

router.post('/admin/projects', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.title) {
      res.status(400).json({ error: 'Project title is required.' });
      return;
    }

    const state = db.getState();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (state.projects.some(p => p.slug === finalSlug)) {
      finalSlug = `${slug}-${counter++}`;
    }

    const newProject: Project = {
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      slug: finalSlug,
      client: data.client?.trim() || '',
      year: data.year || new Date().getFullYear().toString(),
      categorySlug: data.categorySlug || 'brand-identity',
      categoryName: data.categoryName || 'Brand Identity',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []),
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      featured: Boolean(data.featured),
      published: Boolean(data.published),
      order: typeof data.order === 'number' ? data.order : state.projects.length + 1,
      summary: data.summary || '',
      objectives: data.objectives || '',
      concept: data.concept || '',
      process: data.process || '',
      challengesSolutions: data.challengesSolutions || '',
      results: data.results || '',
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      seoTitle: data.seoTitle || `${data.title} | Case Study`,
      seoDescription: data.seoDescription || data.summary || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.updateState(s => {
      s.projects.push(newProject);
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: newProject,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

router.put('/admin/projects/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updatedProject: Project | null = null;

    await db.updateState(state => {
      const idx = state.projects.findIndex(p => p.id === id);
      if (idx === -1) return;

      const current = state.projects[idx];
      let slug = current.slug;
      if (updates.slug && updates.slug !== current.slug) {
        slug = generateSlug(updates.slug);
        // Ensure no collision with other projects
        if (state.projects.some(p => p.id !== id && p.slug === slug)) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }
      }

      updatedProject = {
        ...current,
        ...updates,
        slug,
        tags: Array.isArray(updates.tags) ? updates.tags : (updates.tags ? updates.tags.split(',').map((t: string) => t.trim()) : current.tags),
        updatedAt: new Date().toISOString(),
      };

      state.projects[idx] = updatedProject!;
    });

    if (!updatedProject) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Project updated successfully.',
      project: updatedProject,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
});

router.delete('/admin/projects/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let deleted = false;

    await db.updateState(state => {
      const idx = state.projects.findIndex(p => p.id === id);
      if (idx !== -1) {
        state.projects.splice(idx, 1);
        deleted = true;
      }
    });

    if (!deleted) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete project.' });
  }
});

router.post('/admin/projects/:id/duplicate', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const state = db.getState();
    const source = state.projects.find(p => p.id === id);

    if (!source) {
      res.status(404).json({ error: 'Source project not found.' });
      return;
    }

    const newSlug = `${source.slug}-copy-${Date.now().toString(36)}`;
    const duplicate: Project = {
      ...source,
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copy)`,
      slug: newSlug,
      published: false, // duplicate as draft
      order: state.projects.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.updateState(s => {
      s.projects.push(duplicate);
    });

    res.status(201).json({
      success: true,
      message: 'Project duplicated as draft.',
      project: duplicate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to duplicate project.' });
  }
});

router.post('/admin/projects/reorder', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'orderedIds array is required.' });
      return;
    }

    await db.updateState(state => {
      orderedIds.forEach((id: string, index: number) => {
        const p = state.projects.find(item => item.id === id);
        if (p) {
          p.order = index + 1;
        }
      });
    });

    res.json({ success: true, message: 'Projects reordered successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reorder projects.' });
  }
});

export default router;
