import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { AISecretaryService } from '@/lib/services/ai-secretary.service';
import { generateVisitorId } from '@/lib/utils/auth';
import {
  successResponse,
  errorResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// POST /api/ai/chat - Send message to AI secretary
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{
      profileId: string;
      sessionId?: string;
      message: string;
      visitorInfo?: {
        name?: string;
        email?: string;
        company?: string;
      };
    }>(request);

    if (!body?.profileId || !body?.message) {
      return errorResponse('ProfileId and message are required');
    }

    // Generate session ID if not provided
    const sessionId = body.sessionId || generateVisitorId();

    const result = await AISecretaryService.chat({
      profileId: body.profileId,
      sessionId,
      message: body.message,
      visitorInfo: body.visitorInfo,
    });

    return successResponse({
      reply: result.reply,
      sessionId: result.sessionId,
      state: result.state,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return errorResponse(error.message || 'Failed to process chat message', 500);
  }
}
