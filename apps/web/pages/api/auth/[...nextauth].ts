
// apps/web/pages/api/auth/[...nextauth].ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ─────────────────────────────────────────────
//  EXTEND SESSION & JWT TYPES
// ─────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      userId?: string;
      creatorId?: string;
      creatorHandle?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    creatorId?: string;
    creatorHandle?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    creatorId?: string;
    creatorHandle?: string;
    accessToken?: string;
  }
}

// ─────────────────────────────────────────────
//  NEXTAUTH CONFIG
// ─────────────────────────────────────────────
export default NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Call backend login
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        const body = await res.json();
        if (!body.ok) return null;

        // Backend returns { user: { id, email, creatorId }, token }
        return {
          id: body.user.id,
          email: body.user.email,
          name: body.user.name,
          userId: body.user.id,
          creatorId: body.user.creatorId ?? null,
          creatorHandle: body.user.creatorHandle,  // <-- NEW
          accessToken: body.token,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // Attach user info into JWT
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).userId || user.id;
        token.creatorId = user.creatorId;
        token.creatorHandle = (user as any).creatorHandle;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    // Expose JWT fields into session object
    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId;
        session.user.creatorId = token.creatorId;
        session.user.creatorHandle = token.creatorHandle;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login", // Custom login page
  },
});
