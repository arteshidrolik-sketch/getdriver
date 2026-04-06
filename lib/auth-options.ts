import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Telefon", type: "text" },
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.phone || credentials?.email;
        if (!identifier || !credentials?.password) {
          throw new Error("Telefon/E-posta ve şifre gerekli");
        }

        // Try to find by phone first
        let user = await prisma.user.findUnique({
          where: { phone: identifier },
          include: { driver: true },
        });

        // If not found and identifier looks like email, try email
        if (!user && identifier.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
            include: { driver: true },
          });
        }

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        if (user.status === "BANNED") {
          throw new Error("Hesabınız engellenmiştir");
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Hesabınız askıya alınmıştır");
        }

        if (!user.password) {
          throw new Error("Bu hesap Google ile kayıtlı. Lütfen Google ile giriş yapın.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Geçersiz şifre");
        }

        return {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePhoto: user.profilePhoto,
          driverStatus: user.driver?.approvalStatus || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Fetch full user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { driver: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.driverStatus = dbUser.driver?.approvalStatus || null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).driverStatus = token.driverStatus;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  secret: process.env.NEXTAUTH_SECRET,
};