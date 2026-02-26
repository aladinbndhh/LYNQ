import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { OdooClient } from '@/lib/integrations/odoo-client';
import { Tenant } from '@/lib/db/models';

// Get Odoo config from environment or tenant
async function getOdooConfig() {
  // For now, use hardcoded Odoo URL from env
  // Later, this can be per-tenant
  const odooUrl = process.env.ODOO_URL || 'http://localhost:8069';
  // Database is optional for HTTP JSON web session authentication
  const odooDb = process.env.ODOO_DATABASE || undefined;
  
  return { url: odooUrl, database: odooDb };
}

export const authOptions: NextAuthOptions = {
  providers: [
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

        try {
          const { url, database } = await getOdooConfig();
          
          // Try authenticating with email first, then try as login
          let client = new OdooClient({
            url,
            database,
            username: credentials.email,
            password: credentials.password,
          });

          let uid: number | null = null;
          let loginField = credentials.email;
          
          try {
            uid = await client.authenticate();
          } catch (authError: any) {
            // If authentication fails, try using email as login directly
            // In Odoo, login can be email or a separate login field
            console.log('First auth attempt failed, trying with email as login...');
            
            // Try again with the same credentials (sometimes it's just a network issue)
            try {
              uid = await client.authenticate();
            } catch (retryError: any) {
              console.error('Odoo authentication details:', {
                url,
                database,
                username: credentials.email,
                error: retryError.message || retryError
              });
              throw new Error(`Odoo authentication failed: ${retryError.message || 'Access Denied. Please check your credentials and database name.'}`);
            }
          }
          
          if (!uid || uid === false) {
          throw new Error('Invalid email or password');
        }

          // Get user info from Odoo
          const users = await client.searchRead(
            'res.users',
            [['id', '=', uid]],
            ['id', 'name', 'email', 'login', 'partner_id'],
            1
          );

          if (users.length === 0) {
            throw new Error('User not found');
          }

          const odooUser = users[0];
          
          // Get partner/company info
          let tenantId = null;
          if (odooUser.partner_id) {
            const partners = await client.searchRead(
              'res.partner',
              [['id', '=', odooUser.partner_id[0]]],
              ['company_id'],
              1
            );
            if (partners.length > 0 && partners[0].company_id) {
              tenantId = partners[0].company_id[0].toString();
            }
        }

        return {
            id: odooUser.id.toString(),
            email: odooUser.email || odooUser.login,
            name: odooUser.name,
            tenantId: tenantId || odooUser.id.toString(), // Use user ID as fallback
            role: 'user', // Default role
            odooUserId: odooUser.id,
            odooPassword: credentials.password, // Store for API calls (in production, use session tokens)
          };
        } catch (error: any) {
          console.error('Odoo authentication error:', {
            message: error.message,
            stack: error.stack,
            url: process.env.ODOO_URL,
            database: process.env.ODOO_DATABASE,
          });
          
          // Provide more helpful error messages
          if (error.message?.includes('Access Denied') || error.message?.includes('access denied')) {
            throw new Error('Access Denied. Please verify:\n1. Your email/username is correct\n2. Your password is correct\n3. The Odoo URL is accessible');
          }
          
          throw new Error(error.message || 'Invalid email or password');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.odooUserId = (user as any).odooUserId;
        token.odooPassword = (user as any).odooPassword; // Store password for API calls
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
        (session.user as any).odooUserId = token.odooUserId as number;
        (session as any).odooPassword = token.odooPassword as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
