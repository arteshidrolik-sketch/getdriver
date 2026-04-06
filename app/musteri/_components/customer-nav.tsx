"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Shield, Home, Car, MapPin, CreditCard, Phone, User, LogOut, Menu, X, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CustomerNavProps {
  user: {
    name?: string | null;
    profilePhoto?: string | null;
  };
}

// Desktop menü için tüm öğeler
const navItems = [
  { href: "/musteri", label: "Ana Sayfa", icon: Home },
  { href: "/musteri/talepler", label: "Taleplerim", icon: FileText },
  { href: "/musteri/profil/araclarim", label: "Araçlarım", icon: Car },
  { href: "/musteri/profil/adreslerim", label: "Adreslerim", icon: MapPin },
  { href: "/musteri/profil/odeme", label: "Ödeme", icon: CreditCard },
  { href: "/musteri/profil", label: "Profil", icon: User },
];

// Mobil bottom nav için sadece ana öğeler
const mobileNavItems = [
  { href: "/musteri", label: "Ana Sayfa", icon: Home },
  { href: "/musteri/talepler", label: "Taleplerim", icon: FileText },
  { href: "/musteri/profil/araclarim", label: "Araçlarım", icon: Car },
  { href: "/musteri/profil/odeme", label: "Ödeme", icon: CreditCard },
  { href: "/musteri/profil", label: "Profil", icon: User },
];

export function CustomerNav({ user }: CustomerNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Nav */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link href="/musteri" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    pathname === item.href && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.profilePhoto || undefined} />
              <AvatarFallback>{user.name?.charAt(0) || "M"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/musteri" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            <span className="text-lg font-bold text-green-700">GetDriver</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b shadow-lg p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t safe-area-bottom">
        <div className="flex justify-around items-stretch h-16">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/musteri" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center py-2 px-1 text-[10px] transition-colors touch-manipulation",
                  isActive
                    ? "text-green-600 font-medium"
                    : "text-muted-foreground hover:text-green-600"
                )}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5", isActive && "text-green-600")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}