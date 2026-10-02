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
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        if (process.env.NODE_ENV === "production") {
          return null;
        }

        if (process.env.ENABLE_DEV_LOGIN !== "true") {
          return null;
       }


        
        if (!credentials?.email) return null;
         
        const email = credentials.email.trim().toLowerCase();
        if (!email.endsWith("@rvce.edu.in")) {
          throw new Error("Only @rvce.edu.in emails are allowed.");
        }

        const requestedRole = credentials.role as Role | undefined;
        const role =
          requestedRole === Role.ADMIN ||
          requestedRole === Role.CLUB_OWNER ||
          requestedRole === Role.STUDENT
          
          ? requestedRole
          : Role.STUDENT;
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
          console.error("[Auth] Database authentication failed:", dbError);
          return null;
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user?.email && process.env.ADMIN_EMAILS) {
        const adminEmails = process.env.ADMIN_EMAILS.split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (adminEmails.includes(user.email.toLowerCase())) {
          await prisma.user.updateMany({
            where: { email: user.email.toLowerCase() },
            data: { role: Role.ADMIN },
          });
        }
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      // Strict institutional domain enforcement
      if (!email.endsWith("@rvce.edu.in")) {
        console.warn(`[Auth] Rejected login attempt with non-RVCE email: ${email}`);
        return false;
      }

      if (account?.provider === "google") {
        const googleProfile = profile as { email_verified?: boolean } | undefined;
        if (googleProfile?.email_verified !== true) {
          console.warn(`[Auth] Rejected unverified Google email: ${email}`);
          return false;
        }
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
  secret: process.env.NEXTAUTH_SECRET,
};
