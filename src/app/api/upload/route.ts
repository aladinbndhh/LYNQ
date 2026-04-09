import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Media } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, unauthorizedResponse } from '@/lib/utils/api';

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const RESIZE: Record<string, { width: number; height: number; fit: 'cover' | 'contain' | 'inside' }> = {
  avatar: { width: 400,  height: 400,  fit: 'cover'   },
  logo:   { width: 400,  height: 400,  fit: 'contain' },
  banner: { width: 1200, height: 400,  fit: 'cover'   },
};

function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

// POST /api/upload
// Body: multipart/form-data  { file: File, type: 'avatar' | 'logo' | 'banner' }
// Returns: { success: true, data: { url: string } }
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Auth — supports NextAuth session and mobile JWT Bearer token
    let session;
    try {
      session = await requireAuth(request);
    } catch {
      return unauthorizedResponse();
    }

    // Parse multipart body
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonError('Could not parse upload — send multipart/form-data');
    }

    const file = formData.get('file') as File | null;
    const type = ((formData.get('type') as string) ?? 'avatar').toLowerCase().trim();

    if (!file || file.size === 0) return jsonError('No file provided');
    if (!['avatar', 'logo', 'banner'].includes(type)) return jsonError('type must be avatar, logo, or banner');
    if (file.size > MAX_BYTES) return jsonError(`File too large — max 10 MB`);

    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME.has(mimeType)) return jsonError('Only image files are allowed (JPEG, PNG, WebP, HEIC)');

    // Read bytes — copy into a plain ArrayBuffer to satisfy TypeScript strict types
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Resize with sharp — fall back to raw bytes if sharp unavailable
    let finalBuffer: Buffer = inputBuffer;
    let finalMime           = mimeType;

    try {
      const sharp = (await import('sharp')).default;
      const spec   = RESIZE[type];
      finalBuffer = Buffer.from(
        await sharp(inputBuffer as Buffer<ArrayBuffer>)
          .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer()
      );
      finalMime = 'image/webp';
    } catch {
      // sharp failed (missing native binary) — store the original bytes
      console.warn('[upload] sharp unavailable, storing original bytes');
    }

    // Persist to MongoDB
    const media = await Media.create({
      tenantId:    session.tenantId,
      uploadedBy:  session.id,
      type,
      data:        finalBuffer,
      contentType: finalMime,
      size:        finalBuffer.length,
    });

    const base = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'https://lynq.cards';
    const url  = `${base}/api/images/${media._id.toString()}`;

    return successResponse({ url });
  } catch (error: any) {
    console.error('[upload]', error);
    return jsonError(error?.message ?? 'Upload failed', 500);
  }
}
