"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingCart,
  Download,
  Heart,
  Key,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  MessageSquare,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export function DashboardSidebar() {
  const t = useTranslations("dashboard.sidebar");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;

  const mainLinks = [
    { key: "overview", href: "/dashboard", icon: LayoutDashboard },
    { key: "orders", href: "/dashboard/orders", icon: ShoppingCart },
    { key: "downloads", href: "/dashboard/downloads", icon: Download },
    { key: "licenses", href: "/dashboard/licenses", icon: Key },
    { key: "favorites", href: "/dashboard/favorites", icon: Heart },
    { key: "tickets", href: "/dashboard/tickets", icon: MessageSquare },
    { key: "rewards", href: "/dashboard/rewards", icon: Gift },
  ];

  const bottomLinks = [
    { key: "marketplace", href: "/products", icon: Store },
    { key: "settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/es/dashboard" || pathname === "/en/dashboard";
    return pathname.startsWith("/es" + href) || pathname.startsWith("/en" + href);
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 lg:flex",
        collapsed ? "w-[70px]" : "w-[260px]",
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn("flex items-center gap-3 p-4", collapsed && "justify-center px-2")}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="size-9 shrink-0 ring-2 ring-border/30">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{user?.name ?? t("user")}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full hover:bg-muted"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {mainLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={collapsed ? t(item.key as string) : undefined}
              >
                <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                {!collapsed && <span>{t(item.key as string)}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="space-y-1 p-3">
          {bottomLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={collapsed ? t(item.key as string) : undefined}
              >
                <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                {!collapsed && <span>{t(item.key as string)}</span>}
              </Link>
            );
          })}
        </div>

        <Separator />

        <div className="p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? t("logout") : undefined}
          >
            <LogOut className="size-[18px] shrink-0" />
            {!collapsed && <span>{t("logout")}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
