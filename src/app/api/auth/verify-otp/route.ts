import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/connection';
import { User, Otp } from '@/lib/db/models';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils/api';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await parseRequestBody<{ email: string; code: string }>(request);
    if (!body?.email || !body?.code) {
      return errorResponse('Email and code are required');
    }

    const email = body.email.toLowerCase().trim();
    const code = body.code.trim();

    // Find the most recent unused OTP for this email
    const otpDoc = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return errorResponse('Verification code not found. Please request a new one.', 400);
    }
    if (new Date() > otpDoc.expiresAt) {
      await otpDoc.deleteOne();
      return errorResponse('Verification code has expired. Please request a new one.', 400);
    }
    if (otpDoc.code !== code) {
      return errorResponse('Incorrect verification code. Please try again.', 400);
    }

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    if (!user) return errorResponse('User not found', 404);

    // Send welcome email (non-fatal)
    await sendWelcomeEmail(email, user.name).catch(console.error);

    return successResponse({ email }, 'Email verified successfully');
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return errorResponse(error.message || 'Verification failed', 500);
  }
}
