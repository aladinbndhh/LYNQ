import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['avatar', 'logo', 'banner'] as const;
const MAX_SIZE_MB   = 10;

// POST /api/upload
// Body: multipart/form-data  { file: File, type: 'avatar' | 'logo' | 'banner' }
// Returns: { success: true, url: string }
export async function POST(request: NextRequest) {
  try {
    // Auth — supports both NextAuth session and mobile JWT Bearer token
    const session = await requireAuth(request);
    if (!session) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string | null) ?? 'avatar';

    if (!file) return errorResponse('No file provided', 400);
    if (!ALLOWED_TYPES.includes(type as any)) return errorResponse('Invalid upload type', 400);

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) return errorResponse(`File too large (max ${MAX_SIZE_MB} MB)`, 400);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const folder = `lynq/${session.user.tenantId ?? 'public'}/${type}`;
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          transformation: type === 'banner'
            ? [{ width: 1200, height: 400, crop: 'fill', quality: 'auto' }]
            : type === 'avatar'
            ? [{ width: 400,  height: 400, crop: 'fill', quality: 'auto' }]
            : [{ width: 400,  height: 400, crop: 'pad',  quality: 'auto', background: 'white' }],
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'));
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return successResponse({ url: result.secure_url });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    console.error('[upload]', error);
    return errorResponse(error.message || 'Upload failed', 500);
  }
}
