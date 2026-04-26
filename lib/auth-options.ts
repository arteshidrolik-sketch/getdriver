import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Telefon", type: "text" },
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.phone || credentials?.email;
        // Telefon numarasina 0 ekle (giris icin)
        const phoneWithZero = identifier?.startsWith("0") ? identifier : `0${identifier}`;
        
        if (!identifier || !credentials?.password) {
          throw new Error("Telefon/E-posta ve şifre gerekli");
        }
        
        let user = await prisma.user.findUnique({
          where: { phone: phoneWithZero },
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
        
        // Şifre hash formatını kontrol et
        let isValid = false;
        const passwordHash = user.password;
        
        // bcrypt hash formatı: $2a$10$... veya $2b$10$...
        if (passwordHash.startsWith('$2')) {
          // bcrypt hash - normal karşılaştırma
          isValid = await bcrypt.compare(credentials.password, passwordHash);
        } else {
          // Eski format (düz metin veya başka bir hash)
          // Düz metin karşılaştırma dene
          isValid = credentials.password === passwordHash;
          
          // Eğer eşleşirse, bcrypt'e çevir ve güncelle
          if (isValid) {
            try {
              const newHash = await bcrypt.hash(credentials.password, 10);
              await prisma.user.update({
                where: { id: user.id },
                data: { password: newHash },
              });
              console.log(`[Auth] Şifre bcrypt formatına çevrildi - Kullanıcı: ${user.id}`);
            } catch (hashError) {
              console.error("[Auth] Şifre çevirme hatası:", hashError);
            }
          }
        }
        
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
    async signIn({ user, account }) {
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
