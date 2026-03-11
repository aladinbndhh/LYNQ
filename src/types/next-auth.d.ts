import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      role: 'admin' | 'user';
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: 'admin' | 'user';
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: 'admin' | 'user';
    picture?: string;
  }
}
