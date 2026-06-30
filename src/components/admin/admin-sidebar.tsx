"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  ShoppingCart,
  Users,
  Ticket,
  Percent,
  FileText,
  Mail,
  Settings,
  Database,
  ScrollText,
  Newspaper,
  Store,
  UserCircle,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const items = [
  { key: "overview", href: "/admin", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categories", icon: FolderTree },
  { key: "brands", href: "/admin/brands", icon: Tags },
  { key: "orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "memberships", href: "/admin/memberships", icon: Crown },
  { key: "coupons", href: "/admin/coupons", icon: Percent },
  { key: "blog", href: "/admin/blog", icon: Newspaper },
  { key: "tickets", href: "/admin/tickets", icon: Ticket },
  { key: "emails", href: "/admin/emails", icon: Mail },
  { key: "logs", href: "/admin/logs", icon: ScrollText },
  { key: "backups", href: "/admin/backups", icon: Database },
  { key: "settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const t = useTranslations("admin.menu");
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20 flex flex-col h-[calc(100vh-6rem)]">
        <div className="space-y-1 flex-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {t(item.key as string)}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
