import { NextRequest } from 'next/server';
import sharp from 'sharp';
import connectDB from '@/lib/db/connection';
import { Media } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/utils/api';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB  = 10;

// Resize specs per type
const RESIZE: Record<string, { width: number; height: number; fit: 'cover' | 'contain' | 'inside' }> = {
  avatar: { width: 400,  height: 400,  fit: 'cover'   },
  logo:   { width: 400,  height: 400,  fit: 'contain' },
  banner: { width: 1200, height: 400,  fit: 'cover'   },
};

// POST /api/upload
// Body: multipart/form-data  { file: File, type: 'avatar' | 'logo' | 'banner' }
// Returns: { success: true, data: { url: string } }
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = ((formData.get('type') as string) ?? 'avatar').toLowerCase();

    if (!file) return errorResponse('No file provided', 400);
    if (!['avatar', 'logo', 'banner'].includes(type))
      return errorResponse('type must be avatar, logo, or banner', 400);
    if (!ALLOWED_MIME.includes(file.type))
      return errorResponse('Only JPEG, PNG, WebP, and GIF images are allowed', 400);
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return errorResponse(`File too large — maximum is ${MAX_SIZE_MB} MB`, 400);

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Resize & optimise with sharp (already bundled in Next.js)
    const spec = RESIZE[type];
    const processed = await sharp(inputBuffer)
      .resize(spec.width, spec.height, { fit: spec.fit, withoutEnlargement: true })
      .webp({ quality: 82 })           // normalise to WebP for consistent serving
      .toBuffer();

    // Persist to MongoDB
    const media = await Media.create({
      tenantId:    session.user.tenantId,
      uploadedBy:  session.user.id,
      type,
      data:        processed,
      contentType: 'image/webp',
      size:        processed.length,
    });

    const url = `${process.env.NEXTAUTH_URL ?? ''}/api/images/${media._id.toString()}`;
    return successResponse({ url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    console.error('[upload]', error);
    return errorResponse(error.message || 'Upload failed', 500);
  }
}
