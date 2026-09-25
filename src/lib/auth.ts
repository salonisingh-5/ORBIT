import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          hd: "rvce.edu.in",
          prompt: "select_account",
        },
      },
    }),
    // Development fallback credentials provider for local testing without Google OAuth keys
    CredentialsProvider({
      id: "dev-login",
      name: "RVCE Dev Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@rvce.edu.in" },
        role: { label: "Role", type: "text", placeholder: "STUDENT" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.trim().toLowerCase();
        if (!email.endsWith("@rvce.edu.in")) {
          throw new Error("Only @rvce.edu.in emails are allowed.");
        }

        const role = (credentials.role as Role) || Role.STUDENT;

        try {
          // Find or upsert user in database
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0].replace(".", " ").toUpperCase(),
                role,
              },
            });
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            clubId: dbUser.clubId,
          };
        } catch (dbError) {
          // Fallback if local database is not connected
          console.warn("[Auth] DB lookup skipped in dev mode:", dbError);
          return {
            id: `dev-${role.toLowerCase()}-id`,
            email,
            name: email.split("@")[0].replace(".", " ").toUpperCase(),
            role,
            clubId: role === Role.CLUB_OWNER ? "club-coding-club" : null,
          };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      // Strict institutional domain enforcement
      if (!email.endsWith("@rvce.edu.in")) {
        console.warn(`[Auth] Rejected login attempt with non-RVCE email: ${email}`);
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || Role.STUDENT;
        token.clubId = (user as any).clubId || null;
      } else if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true, clubId: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.clubId = dbUser.clubId;
          }
        } catch {
          // If DB is temporarily unavailable, retain existing token values
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || Role.STUDENT;
        session.user.clubId = token.clubId as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "orbit_rvce_secure_secret_fallback_key",
};
