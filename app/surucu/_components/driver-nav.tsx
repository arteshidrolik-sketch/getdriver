"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Shield, Home, MapPin, Clock, Wallet, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DriverNavProps {
  user: {
    name?: string | null;
    profilePhoto?: string | null;
    driverStatus?: string | null;
  };
}

const navItems = [
  { href: "/surucu", label: "Ana Sayfa", icon: Home },
  { href: "/surucu/talepler", label: "Talepler", icon: MapPin },
  { href: "/surucu/gecmis", label: "Geçmiş", icon: Clock },
  { href: "/surucu/kazanc", label: "Kazanç", icon: Wallet },
  { href: "/surucu/profil", label: "Profil", icon: User },
];

export function DriverNav({ user }: DriverNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPending = user?.driverStatus === "PENDING";

  return (
    <>
      {/* Desktop Nav */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link href="/surucu" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-green-700 dark:text-green-500">GetDriver</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Sürücü</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    pathname === item.href && "bg-green-600 hover:bg-green-700"
                  )}
                  disabled={isPending && item.href !== "/surucu" && item.href !== "/surucu/profil"}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profilePhoto || undefined} />
              <AvatarFallback>{user?.name?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/surucu" className="flex items-center gap-2">
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
                  disabled={isPending && item.href !== "/surucu" && item.href !== "/surucu/profil"}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs",
                pathname === item.href
                  ? "text-green-600"
                  : "text-muted-foreground",
                isPending && item.href !== "/surucu" && item.href !== "/surucu/profil" && "opacity-50 pointer-events-none"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}