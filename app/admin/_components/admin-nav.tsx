"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Shield, LayoutDashboard, Users, Car, ClipboardList, AlertTriangle, CreditCard, Settings, LogOut, Menu, X, UserCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  user: {
    name?: string | null;
  };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/surucu-basvurulari", label: "Sürücü Başvuruları", icon: UserCheck },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/suruculer", label: "Sürücüler", icon: Car },
  { href: "/admin/surusler", label: "Sürüşler", icon: ClipboardList },
  { href: "/admin/uyusmazliklar", label: "Uyuşmazlıklar", icon: AlertTriangle },
  { href: "/admin/odemeler", label: "Ödemeler", icon: CreditCard },
  { href: "/admin/analitik", label: "Analitik", icon: TrendingUp },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <span className="text-lg font-bold text-green-700 dark:text-green-500">GetDriver</span>
              <span className="block text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-green-600 hover:bg-green-700"
                )}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-3 text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-muted-foreground">Admin</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            <span className="text-lg font-bold text-green-700">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b shadow-lg p-4 space-y-2 max-h-[80vh] overflow-y-auto">
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
    </>
  );
}