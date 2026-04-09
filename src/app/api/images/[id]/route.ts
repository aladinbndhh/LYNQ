import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Media } from '@/lib/db/models';

// GET /api/images/:id  — public, no auth required (URLs are unguessable ObjectIds)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const media = await Media.findById(id).select('data contentType').lean();
    if (!media) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(media.data as Buffer, {
      status: 200,
      headers: {
        'Content-Type':  media.contentType as string,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Invalid image ID', { status: 400 });
  }
}
