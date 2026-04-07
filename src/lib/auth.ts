import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/db/connection';
import { User, Tenant, Profile } from '@/lib/db/models';
import { verifyPassword, hashPassword } from '@/lib/utils/auth';

async function fetchTenantSubdomain(tenantId: string): Promise<string | null> {
  try {
    await connectDB();
    const t = await Tenant.findById(tenantId).select('subdomain').lean();
    return (t as { subdomain?: string } | null)?.subdomain ?? null;
  } catch {
    return null;
  }
}

/** Generate a unique username from a display name / email prefix */
async function generateUsername(base: string): Promise<string> {
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'user';

  // Try the base first, then append numbers until unique
  let candidate = sanitized;
  let attempt = 0;
  while (await Profile.exists({ username: candidate })) {
    attempt++;
    candidate = `${sanitized}-${attempt}`;
  }
  return candidate;
}

/**
 * Find or create a MongoDB user+tenant from a Google OAuth profile.
 * On first sign-in, also creates a default Profile pre-filled with
 * the user's Google name, email, and profile picture.
 */
export async function findOrCreateGoogleUser(profile: {
  email: string;
  name: string;
  image?: string;
}) {
  await connectDB();

  let user = await User.findOne({ email: profile.email.toLowerCase() });
  if (user) {
    // Update avatar URL in case it changed
    if (profile.image) {
      await Profile.updateOne(
        { userId: user._id },
        { $setOnInsert: { avatar: profile.image } }
      );
    }
    return {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      name: user.name,
      role: user.role as 'admin' | 'user',
    };
  }

  // First time — create tenant + admin user
  const emailDomain = profile.email.split('@')[1];
  const companyGuess = emailDomain
    .replace(/\.(com|io|co|net|org|app)$/, '')
    .replace(/^www\./, '')
    .split('.')[0];
  const companyName = companyGuess.charAt(0).toUpperCase() + companyGuess.slice(1);

  const tenant = await Tenant.create({
    name: companyName,
    email: profile.email.toLowerCase(),
    subscriptionTier: 'free',
    aiUsageLimit: 50,
    aiUsageCount: 0,
  });

  // Random password hash — Google-only accounts never need it
  const passwordHash = await hashPassword(crypto.randomUUID());

  user = await User.create({
    tenantId: tenant._id,
    email: profile.email.toLowerCase(),
    passwordHash,
    name: profile.name,
    role: 'admin',
  });

  // Auto-create a default Profile pre-filled with Google data
  try {
    const emailPrefix = profile.email.split('@')[0];
    const username = await generateUsername(profile.name || emailPrefix);

    await Profile.create({
      tenantId: tenant._id,
      userId: user._id,
      username,
      displayName: profile.name,
      avatar: profile.image || '',
      contactInfo: {
        email: profile.email.toLowerCase(),
      },
      branding: { primaryColor: '#3b82f6', theme: 'light' },
      aiConfig: {
        enabled: true,
        personality: 'professional and friendly',
        greeting: `Hi! I'm ${profile.name}'s AI assistant. How can I help you today?`,
        qualificationQuestions: ['What brings you here today?', 'Which industry are you in?'],
        autoBooking: true,
      },
      isPublic: true,
      language: 'en',
      timezone: 'UTC',
    });
  } catch (err) {
    // Profile creation is non-fatal — user can create one manually
    console.warn('Auto-profile creation failed:', err);
  }

  return {
    userId: user._id.toString(),
    tenantId: tenant._id.toString(),
    name: user.name,
    role: 'admin' as const,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Google OAuth ─────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // ── Email / Password ─────────────────────────────────────────────────────
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) throw new Error('Invalid email or password');

        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) throw new Error('Invalid email or password');

        if (user.emailVerified === false) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        const tenant = await Tenant.findById(user.tenantId);
        if (!tenant) throw new Error('Account configuration error. Please contact support.');

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          tenantId: user.tenantId.toString(),
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    // Session lives for 8 hours of inactivity max
    maxAge: 8 * 60 * 60,
    // Update the session cookie on every request to keep it alive
    updateAge: 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Share session across org subdomains (e.g. acme.lynq.cards)
        ...(process.env.NEXTAUTH_COOKIE_DOMAIN
          ? { domain: process.env.NEXTAUTH_COOKIE_DOMAIN }
          : {}),
        // No maxAge / expires → becomes a session cookie
        // Browser deletes it when the window/tab is closed
      },
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Google sign-in: ensure MongoDB record exists
      if (account?.provider === 'google' && profile?.email) {
        try {
          await findOrCreateGoogleUser({
            email: profile.email,
            name: (profile as any).name || profile.email.split('@')[0],
            image: (profile as any).picture,
          });
          return true;
        } catch (err) {
          console.error('Google sign-in error:', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      // Initial sign-in via credentials
      if (user && account?.provider === 'credentials') {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name!;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
      }

      // Initial sign-in via Google — look up MongoDB user
      if (account?.provider === 'google' && profile?.email) {
        try {
          const mongoUser = await findOrCreateGoogleUser({
            email: profile.email,
            name: (profile as any).name || profile.email.split('@')[0],
            image: (profile as any).picture,
          });
          token.id = mongoUser.userId;
          token.tenantId = mongoUser.tenantId;
          token.role = mongoUser.role;
          token.name = mongoUser.name;
          token.email = profile.email;
          // Pass Google avatar through
          if ((profile as any).picture) {
            token.picture = (profile as any).picture;
          }
        } catch (err) {
          console.error('JWT Google callback error:', err);
        }
      }

      if (token.tenantId) {
        if (user || token.tenantSubdomain === undefined) {
          token.tenantSubdomain = await fetchTenantSubdomain(token.tenantId as string);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as 'admin' | 'user';
        session.user.tenantSubdomain =
          token.tenantSubdomain === undefined ? null : token.tenantSubdomain;
        // Pass avatar (Google profile picture)
        if (token.picture) {
          (session.user as any).image = token.picture;
        }
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
