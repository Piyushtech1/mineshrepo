import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { sanitizeFilename } from './utils';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Check for Cloudflare R2 credentials
const hasR2 = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

let s3Client: S3Client | null = null;
if (hasR2) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

// Multer memory or disk storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for videos/portfolio assets
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'application/pdf',
    ];
    if (allowedMime.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: images, mp4/webm videos, and PDF resumes.`));
    }
  },
});

export interface UploadResult {
  url: string;
  key: string;
  storage: 'r2' | 'local';
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  type: 'image' | 'video' | 'document';
}

export async function saveMediaFile(file: Express.Multer.File): Promise<UploadResult> {
  const sanitized = sanitizeFilename(file.originalname);
  const isVideo = file.mimetype.startsWith('video/');
  const isDoc = file.mimetype === 'application/pdf';
  const type: 'image' | 'video' | 'document' = isVideo ? 'video' : isDoc ? 'document' : 'image';

  if (s3Client && process.env.R2_BUCKET_NAME) {
    const key = `media/${sanitized}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') ||
      `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `${publicBase}/${key}`;

    return {
      url,
      key,
      storage: 'r2',
      name: sanitized,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      type,
    };
  }

  // Local fallback
  const filePath = path.join(UPLOAD_DIR, sanitized);
  fs.writeFileSync(filePath, file.buffer);
  const url = `/uploads/${sanitized}`;

  return {
    url,
    key: sanitized,
    storage: 'local',
    name: sanitized,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    type,
  };
}

export async function deleteMediaFile(storage: 'r2' | 'local', key: string): Promise<void> {
  if (storage === 'r2' && s3Client && process.env.R2_BUCKET_NAME) {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch (err) {
      console.error('Failed to delete object from R2:', err);
    }
  } else {
    try {
      const filePath = path.join(UPLOAD_DIR, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Failed to delete local file:', err);
    }
  }
}
