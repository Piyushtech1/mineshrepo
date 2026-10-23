import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './src/server/routes/authRoutes';
import projectRoutes from './src/server/routes/projectRoutes';
import categoryRoutes from './src/server/routes/categoryRoutes';
import mediaRoutes from './src/server/routes/mediaRoutes';
import contentRoutes from './src/server/routes/contentRoutes';
import contactRoutes from './src/server/routes/contactRoutes';
import settingsRoutes from './src/server/routes/settingsRoutes';
import { db } from './src/server/db/store';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Basic security and parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static uploads directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api', categoryRoutes);
app.use('/api', mediaRoutes);
app.use('/api', contentRoutes);
app.use('/api', contactRoutes);
app.use('/api', settingsRoutes);

// Fallback error handler for API
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  try {
    await db.init();
    console.log('Database initialized successfully.');

    if (!isProduction) {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
          watch: process.env.DISABLE_HMR === 'true' ? null : {},
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode.');
    } else {
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Portfolio server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();
