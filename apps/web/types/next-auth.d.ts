import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userId: string;
    creatorId?: string | null;
    creatorHandle?: string | null;
    accessToken: string;
  }

  interface User {
    id: string;
    creatorId?: string | null;
    creatorHandle?: string | null;
  }
}
