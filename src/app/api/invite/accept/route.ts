import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { OrgAdminService } from '@/lib/services/org-admin.service';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await parseRequestBody<{ token: string; name: string; password: string }>(request);
    if (!body?.token || !body?.name || !body?.password) {
      return errorResponse('token, name, and password are required', 400);
    }
    if (body.password.length < 6) return errorResponse('Password must be at least 6 characters', 400);

    const result = await OrgAdminService.acceptInvitation(body.token, body.name, body.password);
    return successResponse(result, 'Account created — you can sign in now');
  } catch (e: any) {
    return errorResponse(e?.message || 'Could not accept invitation', 400);
  }
}
