import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  trustHost: true,
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
        let user = await prisma.user.findUnique({
          where: { phone: identifier },
          include: { driver: true },
        });
        if (!user && identifier.includes("@")) {
          user = await prisma.user.findUnique({
            where: { email: identifier },
            include: { driver: true },
          });
        }
        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Hatalı şifre");
        }
        return user as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Google ile giriş yapan kullanıcıyı veritabanında bul veya oluştur
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                profilePhoto: user.image || null,
                role: "CUSTOMER",
              } as any,
            });
          }
          user.id = dbUser.id;
          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { driver: true },
          });
          if (dbUser) {
            token.role = (dbUser as any).role;
            token.phone = (dbUser as any).phone;
            token.driverStatus = (dbUser as any).driver?.approvalStatus || null;
          }
        } catch {}
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
