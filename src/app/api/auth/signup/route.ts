import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant, User } from '@/lib/db/models';
import { hashPassword } from '@/lib/utils/auth';
import {
  successResponse,
  errorResponse,
  parseRequestBody,
} from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{
      name: string;
      email: string;
      password: string;
      companyName: string;
    }>(request);

    if (!body?.name || !body?.email || !body?.password || !body?.companyName) {
      return errorResponse('All fields are required');
    }

    // Check if email already exists
    const existingTenant = await Tenant.findOne({ email: body.email });
    if (existingTenant) {
      return errorResponse('Email already registered', 409);
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: body.companyName,
      email: body.email,
      subscriptionTier: 'free',
      aiUsageLimit: 100,
      aiUsageCount: 0,
    });

    // Create admin user
    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      tenantId: tenant._id,
      email: body.email,
      passwordHash,
      name: body.name,
      role: 'admin',
    });

    return successResponse(
      {
        tenant: {
          id: tenant._id.toString(),
          name: tenant.name,
          email: tenant.email,
        },
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'Account created successfully'
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Failed to create account', 500);
  }
}
