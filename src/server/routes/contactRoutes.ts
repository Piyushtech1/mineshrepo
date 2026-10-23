import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAdmin, AuthenticatedRequest } from '../auth';
import { ContactMessage } from '../db/schema';

const router = Router();

// Public submission
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Your name is required.' });
      return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    if (!message || message.trim().length < 10) {
      res.status(400).json({ error: 'Please provide a message with at least 10 characters.' });
      return;
    }

    const newMessage: ContactMessage = {
      id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      read: false,
      archived: false,
      createdAt: new Date().toISOString(),
    };

    await db.updateState(state => {
      state.contactMessages.unshift(newMessage);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received and will be reviewed shortly.',
      id: newMessage.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit contact message.' });
  }
});

// Admin management
router.get('/admin/contact', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query; // 'unread', 'archived', 'all'
    let messages = [...db.getState().contactMessages];

    if (status === 'unread') {
      messages = messages.filter(m => !m.read && !m.archived);
    } else if (status === 'archived') {
      messages = messages.filter(m => m.archived);
    } else if (status === 'inbox') {
      messages = messages.filter(m => !m.archived);
    }

    res.json({
      messages,
      total: messages.length,
      unreadCount: db.getState().contactMessages.filter(m => !m.read).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch contact messages.' });
  }
});

router.put('/admin/contact/:id/read', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    await db.updateState(state => {
      const msg = state.contactMessages.find(m => m.id === id);
      if (msg) {
        msg.read = read !== undefined ? Boolean(read) : true;
      }
    });

    res.json({ success: true, message: 'Message status updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/contact/:id/archive', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    await db.updateState(state => {
      const msg = state.contactMessages.find(m => m.id === id);
      if (msg) {
        msg.archived = archived !== undefined ? Boolean(archived) : true;
      }
    });

    res.json({ success: true, message: 'Message archive status updated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/contact/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.updateState(state => {
      state.contactMessages = state.contactMessages.filter(m => m.id !== id);
    });

    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
