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
  notFoundResponse,
  parseRequestBody,
} from '@/lib/utils/api';

// GET /api/leads/:id - Get lead by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const lead = await LeadService.getLeadById(id, tenantContext);

    if (!lead) {
      return notFoundResponse('Lead not found');
    }

    return successResponse(lead);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to fetch lead', 500);
  }
}

// PUT /api/leads/:id - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const body = await parseRequestBody<Partial<ILead>>(request);
    
    if (!body) {
      return errorResponse('Invalid request body', 400);
    }

    const lead = await LeadService.updateLead(id, body, tenantContext);

    if (!lead) {
      return notFoundResponse('Lead not found');
    }

    return successResponse(lead, 'Lead updated successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to update lead', 500);
  }
}

// DELETE /api/leads/:id - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);

    const deleted = await LeadService.deleteLead(id, tenantContext);

    if (!deleted) {
      return notFoundResponse('Lead not found');
    }

    return successResponse({ deleted: true }, 'Lead deleted successfully');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return errorResponse(error.message || 'Failed to delete lead', 500);
  }
}
