import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/db/connection';
import { User, Tenant } from '@/lib/db/models';
import { verifyPassword, hashPassword } from '@/lib/utils/auth';

/**
 * Find or create a MongoDB user+tenant from a Google OAuth profile.
 * Returns { userId, tenantId, name, role }.
 */
async function findOrCreateGoogleUser(profile: {
  email: string;
  name: string;
  image?: string;
}) {
  await connectDB();

  let user = await User.findOne({ email: profile.email.toLowerCase() });
  if (user) {
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

  // Random password hash for Google-only accounts (they'll never use it)
  const passwordHash = await hashPassword(crypto.randomUUID());

  user = await User.create({
    tenantId: tenant._id,
    email: profile.email.toLowerCase(),
    passwordHash,
    name: profile.name,
    role: 'admin',
  });

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

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as 'admin' | 'user';
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
