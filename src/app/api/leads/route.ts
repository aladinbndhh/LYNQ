import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { LeadService } from '@/lib/services/lead.service';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { ILead } from '@/types';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// GET /api/leads - List all leads for current tenant
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId') || undefined;
    const status = searchParams.get('status') || undefined;
    const source = searchParams.get('source') || undefined;

    const leads = await LeadService.listLeads(tenantContext, { profileId, status, source });
    return successResponse(leads);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch leads', 500);
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<Partial<ILead>>(request);
    if (!body?.name || !body?.profileId || !body?.source) {
      return errorResponse('name, profileId, and source are required', 400);
    }

    const lead = await LeadService.createLead(body, tenantContext);
    return successResponse(lead, 'Lead created successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to create lead', 500);
  }
}
