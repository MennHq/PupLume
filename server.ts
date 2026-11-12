import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processAIChat, processAIOnboardingChat } from './src/server/geminiService.ts';
import { uploadToCloudinary, deleteFromCloudinary } from './src/server/cloudinaryService.ts';
import {
  verifyPaddleWebhookSignature,
  sanitizeErrorMessage,
  parseMultipartUpload,
  applyCorsHeaders,
} from './api/_utils.ts';
import pupOgHandler from './api/og/pup.ts';
import pupMetaHandler from './api/pup-meta.ts';
import { isPublicPuppyPath } from './src/lib/slugHelper.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security & CORS Middleware
app.use((req, res, next) => {
  applyCorsHeaders(res, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// JSON and URL-Encoded Body Parsing (with rawBody capture for webhook signature verification)
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------
// 1. AI Assistant & Onboarding Routes
// ----------------------------------------------------
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { message, puppyContext, userId } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Field "message" is required' });
    }

    if (message.length > 8000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 8000 characters' });
    }

    const result = await processAIChat({
      message: message.trim(),
      puppyContext: puppyContext && typeof puppyContext === 'object' ? puppyContext : ({} as any),
      userId: typeof userId === 'string' ? userId.slice(0, 100) : undefined,
    });
    return res.json(result);
  } catch (error: any) {
    console.error('Server error processing AI chat:', sanitizeErrorMessage(error));
    return res.status(500).json({
      error: sanitizeErrorMessage(
        error,
        'The AI assistant is temporarily unavailable. Please try again shortly.'
      ),
    });
  }
});

app.post('/api/ai-onboarding', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    if (typeof payload.message === 'string' && payload.message.length > 8000) {
      payload.message = payload.message.slice(0, 8000);
    }

    const result = await processAIOnboardingChat(payload);
    return res.json(result);
  } catch (error: any) {
    console.error('Server error processing AI onboarding:', sanitizeErrorMessage(error));
    return res.status(500).json({
      error: sanitizeErrorMessage(
        error,
        'The AI onboarding service is temporarily unavailable. Please try again shortly.'
      ),
    });
  }
});

// ----------------------------------------------------
// 2. Paddle Billing Webhook Route
// ----------------------------------------------------
app.post('/api/billing/webhook', async (req: any, res) => {
  try {
    const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const signatureHeader =
      (req.headers['paddle-signature'] as string) ||
      (req.headers['Paddle-Signature'] as string) ||
      null;

    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;

    // Strict validation: Webhook secret MUST be configured
    if (!secretKey || secretKey.trim().length === 0) {
      console.error('[Paddle Webhook] Server error: PADDLE_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook signature verification unavailable' });
    }

    const verification = verifyPaddleWebhookSignature(
      rawBodyBuffer,
      signatureHeader,
      secretKey,
      300 // 5-minute replay tolerance
    );

    if (!verification.isValid) {
      console.warn(`[Paddle Webhook] Rejected unauthorized event: ${verification.reason}`);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const payload = req.body || {};
    const eventType = String(payload.event_type || 'unknown');
    const eventId = payload.event_id ? String(payload.event_id) : undefined;
    console.log(`[Paddle Webhook] Verified event: ${eventType} (${eventId || 'no-id'})`);

    return res.status(200).json({
      received: true,
      eventType,
      eventId,
    });
  } catch (error: any) {
    console.error('[Paddle Webhook Error]:', sanitizeErrorMessage(error));
    return res.status(500).json({
      error: sanitizeErrorMessage(error, 'Webhook processing failed'),
    });
  }
});

// ----------------------------------------------------
// 3. Cloudinary Upload Routes (supports JSON and Multipart)
// ----------------------------------------------------
const handleUpload = async (req: express.Request, res: express.Response) => {
  try {
    const contentType = req.headers['content-type'] || '';
    let fileData = '';
    let folder = 'puplume/pets';
    let tags: string[] = ['puplume', 'pets'];
    let previousImageUrl: string | undefined;
    let previousPublicId: string | undefined;

    // If multipart/form-data upload
    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseMultipartUpload(req, {
        maxFileSize: 10 * 1024 * 1024,
        maxFields: 10,
      });

      if (!parsed.file || !parsed.file.buffer || parsed.file.buffer.length === 0) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      fileData = `data:${parsed.file.mimeType};base64,${parsed.file.buffer.toString('base64')}`;
      (parsed.file as any).buffer = null; // free memory

      if (parsed.fields.folder) {
        folder = parsed.fields.folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').slice(0, 100) || folder;
      }
      if (parsed.fields.tags) {
        tags = parsed.fields.tags.split(',').map((t) => t.trim().slice(0, 50)).filter(Boolean);
      }
      if (parsed.fields.previousImageUrl) {
        previousImageUrl = parsed.fields.previousImageUrl.slice(0, 500);
      }
      if (parsed.fields.previousPublicId) {
        previousPublicId = parsed.fields.previousPublicId.slice(0, 300);
      }
    } else {
      // JSON body
      const { file, folder: reqFolder, tags: reqTags, previousImageUrl: prevUrl, previousPublicId: prevId } = req.body || {};
      if (!file || typeof file !== 'string' || file.trim().length === 0) {
        return res.status(400).json({ error: 'No image file or data URI provided' });
      }

      fileData = file.trim();
      if (reqFolder && typeof reqFolder === 'string') {
        folder = reqFolder.replace(/[^a-zA-Z0-9_\-\/]/g, '').slice(0, 100) || folder;
      }
      if (Array.isArray(reqTags)) {
        tags = reqTags.filter((t) => typeof t === 'string').map((t) => t.trim().slice(0, 50)).filter(Boolean);
      }
      if (prevUrl && typeof prevUrl === 'string') {
        previousImageUrl = prevUrl.slice(0, 500);
      }
      if (prevId && typeof prevId === 'string') {
        previousPublicId = prevId.slice(0, 300);
      }
    }

    const result = await uploadToCloudinary(fileData, {
      folder,
      tags: tags.length > 0 ? tags : ['puplume', 'pets'],
      previousImageUrl,
      previousPublicId,
    });

    fileData = ''; // free memory

    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Server error uploading to Cloudinary:', sanitizeErrorMessage(error));
    return res.status(500).json({
      error: sanitizeErrorMessage(error, 'Cloudinary upload failed'),
    });
  }
};

// ----------------------------------------------------
// 4. Cloudinary Delete Routes
// ----------------------------------------------------
const PROTECTED_TARGETS = ['puplume', 'pupcollar', 'branding', 'system', 'assets', 'og-', 'favicon'];

const handleDelete = async (req: express.Request, res: express.Response) => {
  try {
    const { url, publicId } = req.body || {};
    const rawTarget = url || publicId;
    if (!rawTarget || typeof rawTarget !== 'string' || rawTarget.trim().length === 0) {
      return res.status(400).json({ error: 'No image url or publicId provided' });
    }

    const target = rawTarget.trim();
    if (target.length > 1024) {
      return res.status(400).json({ error: 'Target identifier is too long' });
    }

    const lowerTarget = target.toLowerCase();
    for (const prefix of PROTECTED_TARGETS) {
      if (lowerTarget.includes(prefix)) {
        return res.status(403).json({ error: 'Deletion of protected assets is prohibited' });
      }
    }

    const result = await deleteFromCloudinary(target);
    return res.json({
      success: result.success,
      result: result.result || (result.success ? 'ok' : 'failed'),
    });
  } catch (error: any) {
    console.error('Server error deleting from Cloudinary:', sanitizeErrorMessage(error));
    return res.status(500).json({
      error: sanitizeErrorMessage(error, 'Cloudinary delete failed'),
    });
  }
};

app.post('/api/upload', handleUpload);
app.post('/api/cloudinary/upload', handleUpload);
app.post('/api/cloudinary/delete', handleDelete);
app.post('/api/delete-image', handleDelete);

// ----------------------------------------------------
// 5. OpenGraph & Dynamic Puppy Metadata Routes
// ----------------------------------------------------
app.get(['/api/og/pup', '/api/og'], async (req, res) => {
  return pupOgHandler(req as any, res as any);
});

app.get(['/pup/:slug', '/safety/:slug'], async (req, res) => {
  return pupMetaHandler(req as any, res as any);
});

app.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug;
  if (isPublicPuppyPath('/' + slug)) {
    return pupMetaHandler(req as any, res as any);
  }
  next();
});

// ----------------------------------------------------
// 6. Static Assets & SPA Fallback
// ----------------------------------------------------
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// API 404 Guard: Ensure unknown API routes return JSON 404 rather than HTML
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ----------------------------------------------------
// 6. Centralized Error Handling Middleware
// ----------------------------------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  console.error('Unhandled server error:', sanitizeErrorMessage(err));
  return res.status(500).json({ error: 'Internal server error' });
});

// ----------------------------------------------------
// 7. Server Initialization & Graceful Shutdown
// ----------------------------------------------------
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`PupLume server running on http://0.0.0.0:${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
