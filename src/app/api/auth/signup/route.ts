import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { Tenant, User, Otp } from '@/lib/db/models';
import { hashPassword } from '@/lib/utils/auth';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const email = body.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.emailVerified) {
        return errorResponse('Email already registered', 409);
      }
      // Unverified account exists — resend a fresh OTP instead of erroring
      const otp = generateOtp();
      await Otp.deleteMany({ email });
      await Otp.create({ email, code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
      await sendOtpEmail(email, existing.name, otp).catch(console.error);
      return successResponse({ email, resent: true }, 'Verification code resent');
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: body.companyName,
      email,
      subscriptionTier: 'free',
      aiUsageLimit: 100,
      aiUsageCount: 0,
    });

    // Create unverified user
    const passwordHash = await hashPassword(body.password);
    const user = await User.create({
      tenantId: tenant._id,
      email,
      passwordHash,
      name: body.name,
      role: 'admin',
      emailVerified: false,
    });

    // Generate + store OTP
    const otp = generateOtp();
    await Otp.create({
      email,
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP email (non-fatal)
    await sendOtpEmail(email, body.name, otp).catch(console.error);

    return successResponse(
      { email, userId: user._id.toString() },
      'Account created — check your email for the verification code'
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Failed to create account', 500);
  }
}
