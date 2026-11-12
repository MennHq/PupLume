import crypto from 'crypto';
import Busboy from 'busboy';
import type { IncomingMessage } from 'http';

/**
 * Standard CORS headers for serverless endpoints and local server.
 */
export function applyCorsHeaders(
  res: any,
  allowedMethods = 'POST, OPTIONS'
): void {
  if (!res || typeof res.setHeader !== 'function') return;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Paddle-Signature, paddle-signature'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * Handles CORS OPTIONS preflight request.
 * Returns true if the request was an OPTIONS preflight and has been answered.
 */
export function handlePreflight(
  req: { method?: string },
  res: any,
  allowedMethods = 'POST, OPTIONS'
): boolean {
  if (req.method === 'OPTIONS') {
    applyCorsHeaders(res, allowedMethods);
    if (typeof res.status === 'function') {
      res.status(204).end();
    } else if (typeof res.writeHead === 'function') {
      res.writeHead(204);
      res.end();
    }
    return true;
  }
  return false;
}

/**
 * Strips secrets, API keys, file system paths, and stack traces from error messages
 * before returning them in HTTP responses.
 */
export function sanitizeErrorMessage(
  err: unknown,
  fallback = 'Internal server error'
): string {
  if (!err) return fallback;
  const rawMsg = err instanceof Error ? err.message : String(err);
  if (!rawMsg) return fallback;

  // Sensitive patterns: API keys, tokens, credentials, and internal stack traces
  const hasSecret =
    /AIza[0-9A-Za-z\-_]{15,}/i.test(rawMsg) ||
    /pdl_[0-9A-Za-z_\-]{10,}/i.test(rawMsg) ||
    /cloudinary|api_key|api_secret|secret_key|bearer|webhook_secret/i.test(rawMsg) ||
    /([a-zA-Z]:\\[^"'\n\r]+)|(\/(?:var|tmp|home|usr|node_modules)[^"'\n\r]+)/i.test(rawMsg) ||
    /at\s+[a-zA-Z0-9_.]+\s+\(/i.test(rawMsg);

  if (hasSecret) {
    return fallback;
  }

  // Clean remaining paths or unwanted tokens
  const cleaned = rawMsg
    .replace(/[A-Za-z]:\\[^"'\n\r]+/g, '')
    .replace(/\/(?:var|tmp|home|usr|node_modules)[^"'\n\r]+/g, '')
    .trim();

  return cleaned.length > 0 && cleaned.length <= 250 ? cleaned : fallback;
}

/**
 * Reads an incoming HTTP stream into a single Buffer with strict size bounding.
 * Protects against unbounded memory allocation / DoS attacks.
 */
export async function readStreamWithLimit(
  req: IncomingMessage & { rawBody?: Buffer; body?: any },
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): Promise<Buffer> {
  // If request has already been buffered by Express verify or middleware
  if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
    if (req.rawBody.length > maxSizeBytes) {
      throw new Error(`Payload exceeds maximum allowed size of ${maxSizeBytes} bytes`);
    }
    return req.rawBody;
  }

  // If already parsed as a Buffer
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxSizeBytes) {
      throw new Error(`Payload exceeds maximum allowed size of ${maxSizeBytes} bytes`);
    }
    return req.body;
  }

  // Check Content-Length header upfront
  const contentLength = parseInt(
    (req.headers?.['content-length'] as string) || '0',
    10
  );
  if (contentLength > maxSizeBytes) {
    throw new Error(
      `Payload size of ${contentLength} bytes exceeds limit of ${maxSizeBytes} bytes`
    );
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let receivedBytes = 0;
    let isSettled = false;

    const cleanup = () => {
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('error', onError);
      req.removeListener('close', onClose);
      req.removeListener('aborted', onAborted);
    };

    const settle = (err?: Error | null, result?: Buffer) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      if (err) {
        if (typeof (req as any).destroy === 'function') {
          (req as any).destroy();
        }
        reject(err);
      } else {
        resolve(result || Buffer.alloc(0));
      }
    };

    const onData = (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      receivedBytes += buf.length;
      if (receivedBytes > maxSizeBytes) {
        settle(
          new Error(`Payload exceeds maximum allowed size of ${maxSizeBytes} bytes`)
        );
        return;
      }
      chunks.push(buf);
    };

    const onEnd = () => {
      settle(null, Buffer.concat(chunks));
    };

    const onError = (err: Error) => {
      settle(err);
    };

    const onClose = () => {
      if (!isSettled) {
        settle(new Error('Request stream closed prematurely'));
      }
    };

    const onAborted = () => {
      settle(new Error('Request aborted by client'));
    };

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
    req.on('close', onClose);
    req.on('aborted', onAborted);
  });
}

/**
 * Validates Paddle Webhook HMAC signature with timing-safe comparison and replay protection.
 * Header format: ts=1690000000;h1=hash_hex (or multiple h1 entries).
 */
export function verifyPaddleWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secretKey: string | null | undefined,
  toleranceSeconds: number = 300 // 5 minutes replay tolerance
): { isValid: boolean; reason?: string; timestamp?: number } {
  if (!secretKey || secretKey.trim().length === 0) {
    return { isValid: false, reason: 'secret_not_configured' };
  }

  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return { isValid: false, reason: 'missing_signature_header' };
  }

  const parts = signatureHeader.split(';');
  let ts = '';
  const hashes: string[] = [];

  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k === 'ts') ts = v;
    if (k === 'h1' && v) hashes.push(v);
  }

  if (!ts || hashes.length === 0) {
    return { isValid: false, reason: 'invalid_signature_format' };
  }

  const timestampNum = parseInt(ts, 10);
  if (isNaN(timestampNum) || timestampNum <= 0) {
    return { isValid: false, reason: 'invalid_timestamp' };
  }

  // Prevent replay attacks: ensure timestamp is within tolerance window
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > toleranceSeconds) {
    return { isValid: false, reason: 'timestamp_out_of_range', timestamp: timestampNum };
  }

  const rawBodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
  const signedPayload = `${ts}:${rawBodyStr}`;

  // Calculate expected HMAC SHA-256
  const expectedHash = crypto
    .createHmac('sha256', secretKey.trim())
    .update(signedPayload, 'utf8')
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  // Compare timing-safely against provided h1 hashes
  let matched = false;
  for (const candidate of hashes) {
    const candidateBuffer = Buffer.from(candidate, 'hex');
    if (
      candidateBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
    ) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    return { isValid: false, reason: 'signature_mismatch' };
  }

  return { isValid: true, timestamp: timestampNum };
}

export interface ParsedMultipartFile {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ParsedMultipart {
  file?: ParsedMultipartFile;
  fields: Record<string, string>;
}

/**
 * Parses multipart/form-data with Busboy with memory bounding, stream draining,
 * and guaranteed Promise settlement.
 */
export async function parseMultipartUpload(
  req: IncomingMessage,
  options: {
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    maxFields?: number;
  } = {}
): Promise<ParsedMultipart> {
  const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
  const allowedMimeTypes = options.allowedMimeTypes || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif',
  ];
  const maxFields = options.maxFields || 20;

  return new Promise<ParsedMultipart>((resolve, reject) => {
    let busboyInstance: Busboy.Busboy | null = null;
    let isSettled = false;
    let fieldCount = 0;
    const fields: Record<string, string> = {};
    let parsedFile: ParsedMultipartFile | undefined;
    let activeFileStream: any = null;

    const cleanup = () => {
      req.removeListener('aborted', onAborted);
      req.removeListener('close', onClose);
      if (busboyInstance) {
        req.unpipe(busboyInstance);
      }
    };

    const settle = (err?: Error | null, result?: ParsedMultipart) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();

      if (err) {
        if (activeFileStream && typeof activeFileStream.resume === 'function') {
          activeFileStream.resume();
        }
        reject(err);
      } else {
        resolve(result || { fields });
      }
    };

    const onAborted = () => {
      settle(new Error('Upload aborted by client'));
    };

    const onClose = () => {
      if (!isSettled && !parsedFile) {
        settle(new Error('Connection closed before upload completed'));
      }
    };

    req.on('aborted', onAborted);
    req.on('close', onClose);

    try {
      busboyInstance = Busboy({
        headers: req.headers,
        limits: {
          fileSize: maxFileSize,
          files: 1,
          fields: maxFields,
          fieldSize: 1024 * 1024, // 1MB per field
        },
      });
    } catch (err: any) {
      settle(new Error(err?.message || 'Failed to initialize multipart parser'));
      return;
    }

    busboyInstance.on('field', (name, value) => {
      fieldCount++;
      if (fieldCount <= maxFields) {
        fields[name] = value;
      }
    });

    busboyInstance.on('file', (_fieldname, fileStream, info) => {
      // If we already received a file, drain and discard any extra files to prevent stream hanging
      if (parsedFile) {
        fileStream.resume();
        return;
      }

      activeFileStream = fileStream;
      const { filename, mimeType } = info;
      const normalizedMime = (mimeType || 'application/octet-stream').toLowerCase();

      // Validate MIME type
      if (!allowedMimeTypes.includes(normalizedMime)) {
        fileStream.resume();
        settle(
          new Error(
            `Unsupported file type: ${normalizedMime}. Allowed types: ${allowedMimeTypes.join(', ')}`
          )
        );
        return;
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;
      let limitExceeded = false;

      fileStream.on('data', (chunk: Buffer) => {
        if (limitExceeded) return;
        totalBytes += chunk.length;
        if (totalBytes > maxFileSize) {
          limitExceeded = true;
          chunks.length = 0; // Free memory immediately
          fileStream.resume();
          settle(
            new Error(
              `File size exceeds maximum allowed limit of ${Math.round(maxFileSize / (1024 * 1024))}MB`
            )
          );
          return;
        }
        chunks.push(chunk);
      });

      fileStream.on('limit', () => {
        limitExceeded = true;
        chunks.length = 0;
        fileStream.resume();
        settle(
          new Error(
            `File size exceeds maximum allowed limit of ${Math.round(maxFileSize / (1024 * 1024))}MB`
          )
        );
      });

      fileStream.on('error', (err: Error) => {
        chunks.length = 0;
        settle(err);
      });

      fileStream.on('end', () => {
        activeFileStream = null;
        if (!limitExceeded && chunks.length > 0) {
          const finalBuffer = Buffer.concat(chunks);
          chunks.length = 0; // Clear chunk references
          parsedFile = {
            buffer: finalBuffer,
            filename: filename || 'uploaded_image',
            mimeType: normalizedMime,
            size: finalBuffer.length,
          };
        }
      });
    });

    busboyInstance.on('finish', () => {
      settle(null, {
        file: parsedFile,
        fields,
      });
    });

    busboyInstance.on('error', (err: Error) => {
      settle(err);
    });

    req.pipe(busboyInstance);
  });
}

/**
 * Escapes strings for safe injection into HTML <script> tags to prevent Reflected XSS.
 */
export function safeJsonScriptEmbed(data: any): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
