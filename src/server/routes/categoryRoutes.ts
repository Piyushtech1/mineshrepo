import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';
import { generateSlug } from '../utils';
import { ProjectCategory } from '../db/schema';

const router = Router();

router.get('/categories', (_req: Request, res: Response) => {
  try {
    const state = db.getState();
    const categoriesWithCount = state.categories.map(cat => {
      const count = state.projects.filter(p => p.published && p.categorySlug === cat.slug).length;
      return {
        ...cat,
        projectCount: count,
      };
    });

    res.json({ categories: categoriesWithCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories.' });
  }
});

router.post('/admin/categories', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }

    const state = db.getState();
    const slug = generateSlug(name);

    if (state.categories.some(c => c.slug === slug)) {
      res.status(400).json({ error: 'A category with this name or slug already exists.' });
      return;
    }

    const newCategory: ProjectCategory = {
      id: `cat_${Date.now().toString(36)}`,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      order: state.categories.length + 1,
    };

    await db.updateState(s => {
      s.categories.push(newCategory);
    });

    res.status(201).json({ success: true, category: newCategory });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category.' });
  }
});

router.put('/admin/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, order } = req.body;

    let updatedCat: ProjectCategory | null = null;
    let oldSlug = '';
    let newSlug = '';

    await db.updateState(state => {
      const idx = state.categories.findIndex(c => c.id === id);
      if (idx === -1) return;

      oldSlug = state.categories[idx].slug;
      newSlug = name ? generateSlug(name) : oldSlug;

      state.categories[idx] = {
        ...state.categories[idx],
        name: name ? name.trim() : state.categories[idx].name,
        slug: newSlug,
        description: description !== undefined ? description : state.categories[idx].description,
        order: typeof order === 'number' ? order : state.categories[idx].order,
      };

      updatedCat = state.categories[idx];

      // Update projects that used the old category slug
      if (oldSlug !== newSlug) {
        state.projects.forEach(p => {
          if (p.categorySlug === oldSlug) {
            p.categorySlug = newSlug;
            p.categoryName = updatedCat!.name;
          }
        });
      }
    });

    if (!updatedCat) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    res.json({ success: true, category: updatedCat });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update category.' });
  }
});

router.delete('/admin/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let deleted = false;

    await db.updateState(state => {
      const idx = state.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        state.categories.splice(idx, 1);
        deleted = true;
      }
    });

    if (!deleted) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete category.' });
  }
});

export default router;
