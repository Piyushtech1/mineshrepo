import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';
import { upload, saveMediaFile, deleteMediaFile } from '../storage';
import { checkMediaUsage } from '../utils';
import { MediaAsset } from '../db/schema';

const router = Router();

router.get('/media', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, search, sort } = req.query;
    let list = [...db.getState().media];

    if (type && type !== 'all') {
      list = list.filter(m => m.type === type);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.originalName.toLowerCase().includes(q) ||
          m.alt.toLowerCase().includes(q) ||
          (m.caption && m.caption.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy = (sort as string) || 'newest';
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.size - a.size;
      return 0;
    });

    res.json({
      media: list,
      total: list.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch media assets.' });
  }
});

router.post(
  '/media/upload',
  requireAdmin,
  upload.array('files', 10),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files were uploaded.' });
        return;
      }

      const createdAssets: MediaAsset[] = [];

      for (const file of files) {
        const saved = await saveMediaFile(file);
        const asset: MediaAsset = {
          id: `med_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          name: saved.name,
          originalName: saved.originalName,
          url: saved.url,
          type: saved.type,
          mimeType: saved.mimeType,
          size: saved.size,
          alt: file.originalname.replace(/\.[^/.]+$/, ''),
          caption: '',
          storage: saved.storage,
          key: saved.key,
          createdAt: new Date().toISOString(),
        };

        await db.updateState(state => {
          state.media.unshift(asset);
        });

        createdAssets.push(asset);
      }

      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${createdAssets.length} asset(s).`,
        assets: createdAssets,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to process media upload.' });
    }
  }
);

router.get('/media/:id/usage', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const state = db.getState();
    const asset = state.media.find(m => m.id === id);

    if (!asset) {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    const usage = checkMediaUsage(asset.id, asset.url, {
      projects: state.projects,
      profile: state.profile,
      resume: state.resume,
      customPages: state.customPages,
    });

    res.json({
      asset,
      usage,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check media usage.' });
  }
});

router.put('/media/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { alt, caption, originalName } = req.body;

    let updatedAsset: MediaAsset | null = null;

    await db.updateState(state => {
      const idx = state.media.findIndex(m => m.id === id);
      if (idx !== -1) {
        state.media[idx] = {
          ...state.media[idx],
          alt: alt !== undefined ? alt : state.media[idx].alt,
          caption: caption !== undefined ? caption : state.media[idx].caption,
          originalName: originalName !== undefined ? originalName : state.media[idx].originalName,
        };
        updatedAsset = state.media[idx];
      }
    });

    if (!updatedAsset) {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    res.json({ success: true, asset: updatedAsset });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update asset metadata.' });
  }
});

router.delete('/media/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    const state = db.getState();
    const asset = state.media.find(m => m.id === id);

    if (!asset) {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    const usage = checkMediaUsage(asset.id, asset.url, {
      projects: state.projects,
      profile: state.profile,
      resume: state.resume,
      customPages: state.customPages,
    });

    if (usage.isUsed && force !== 'true') {
      res.status(409).json({
        error: 'Asset is currently in use.',
        usage,
        message: 'This asset is currently referenced. Provide force=true query parameter to delete permanently.',
      });
      return;
    }

    // Delete physical file
    await deleteMediaFile(asset.storage, asset.key);

    // Remove from database
    await db.updateState(s => {
      const idx = s.media.findIndex(m => m.id === id);
      if (idx !== -1) {
        s.media.splice(idx, 1);
      }
    });

    res.json({ success: true, message: 'Asset permanently deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete asset.' });
  }
});

export default router;
