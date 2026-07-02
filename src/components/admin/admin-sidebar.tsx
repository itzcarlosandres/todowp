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
  Newspaper,
  Settings,
  Crown,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Section = {
  label: string;
  items: { key: string; href: string; icon: React.ElementType }[];
};

export function AdminSidebar() {
  const t = useTranslations("admin.menu");
  const pathname = usePathname();

  const sections: Section[] = [
    {
      label: t("sectionPrincipal"),
      items: [
        { key: "overview", href: "/admin", icon: LayoutDashboard },
        { key: "products", href: "/admin/products", icon: Package },
        { key: "categories", href: "/admin/categories", icon: FolderTree },
        { key: "brands", href: "/admin/brands", icon: Tags },
      ],
    },
    {
      label: t("sectionSales"),
      items: [
        { key: "orders", href: "/admin/orders", icon: ShoppingCart },
        { key: "coupons", href: "/admin/coupons", icon: Percent },
        { key: "cashback", href: "/admin/cashback", icon: Gift },
      ],
    },
    {
      label: t("sectionUsers"),
      items: [
        { key: "users", href: "/admin/users", icon: Users },
        { key: "memberships", href: "/admin/memberships", icon: Crown },
        { key: "tickets", href: "/admin/tickets", icon: Ticket },
      ],
    },
    {
      label: t("sectionContent"),
      items: [
        { key: "blog", href: "/admin/blog", icon: Newspaper },
      ],
    },
    {
      label: t("sectionConfig"),
      items: [
        { key: "settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20 flex flex-col h-[calc(100vh-6rem)]">
        <div className="flex-1 space-y-5 overflow-y-auto py-2">
          {sections.map((section) => (
            <div key={section.label} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                {section.label}
              </h4>
              {section.items.map((item) => {
                const Icon = item.icon;
                const href = item.href;
                const active =
                  href === "/admin"
                    ? pathname === "/es/admin" || pathname === "/en/admin"
                    : pathname.startsWith("/es" + href) || pathname.startsWith("/en" + href);

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-500/10 text-brand-500"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active && "text-brand-500")} />
                    <span>{t(item.key as string)}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
