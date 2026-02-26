import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { AISecretaryService } from '@/lib/services/ai-secretary.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/utils/api';

// GET /api/ai/conversation/:sessionId - Get conversation history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();

    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return errorResponse('ProfileId query parameter is required');
    }

    const conversation = await AISecretaryService.getConversation(
      profileId,
      sessionId
    );

    if (!conversation) {
      return notFoundResponse('Conversation not found');
    }

    return successResponse({
      conversation: {
        sessionId: conversation.visitorId,
        status: conversation.status,
        messages: conversation.messages,
        leadInfo: conversation.leadInfo,
      },
    });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    return errorResponse(error.message || 'Failed to fetch conversation', 500);
  }
}
