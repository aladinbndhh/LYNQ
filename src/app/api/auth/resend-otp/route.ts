import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { User, Otp } from '@/lib/db/models';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';
import { sendOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{ email: string }>(request);
    if (!body?.email) return errorResponse('Email is required');

    const email = body.email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) return errorResponse('Account not found', 404);
    if (user.emailVerified) return errorResponse('Email already verified', 400);

    // Rate-limit: block if a code was sent in the last 60 seconds
    const recent = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (recent) {
      const secondsAgo = (Date.now() - new Date(recent.createdAt).getTime()) / 1000;
      if (secondsAgo < 60) {
        return errorResponse(
          `Please wait ${Math.ceil(60 - secondsAgo)} seconds before requesting a new code.`,
          429
        );
      }
    }

    // Invalidate old OTPs and issue a fresh one
    await Otp.deleteMany({ email });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

    await sendOtpEmail(email, user.name, code).catch(console.error);

    return successResponse({ email }, 'Verification code resent');
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return errorResponse(error.message || 'Failed to resend code', 500);
  }
}
