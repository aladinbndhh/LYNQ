import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { User, Tenant } from '@/lib/db/models';
import { verifyPassword, generateToken } from '@/lib/utils/auth';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';

/**
 * POST /api/auth/mobile/login
 *
 * Returns a long-lived JWT for the Flutter mobile app.
 * The token can be used as a Bearer token in Authorization headers.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{ email: string; password: string }>(request);

    if (!body?.email || !body?.password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      return errorResponse('Invalid email or password', 401);
    }

    const tenant = await Tenant.findById(user.tenantId).select('name email subscriptionTier');
    if (!tenant) {
      return errorResponse('Account error. Please contact support.', 500);
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      tenantId: user.tenantId.toString(),
      role: user.role,
    });

    return successResponse({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId.toString(),
      },
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        email: tenant.email,
        subscriptionTier: tenant.subscriptionTier,
      },
    }, 'Login successful');
  } catch (error: any) {
    console.error('Mobile login error:', error);
    return errorResponse(error.message || 'Login failed', 500);
  }
}
