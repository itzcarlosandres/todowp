import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  localeDetection: true,
  pathnames: {
    "/": "/",
    "/products": "/products",
    "/product/[slug]": "/product/[slug]",
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/login": "/login",
    "/forgot-password": "/forgot-password",
    "/register": "/register",
    "/cart": "/cart",
    "/checkout": "/checkout",
    "/dashboard": "/dashboard",
    "/dashboard/orders": "/dashboard/orders",
    "/dashboard/downloads": "/dashboard/downloads",
    "/dashboard/licenses": "/dashboard/licenses",
    "/dashboard/favorites": "/dashboard/favorites",
    "/dashboard/settings": "/dashboard/settings",
    "/dashboard/tickets": "/dashboard/tickets",
    "/dashboard/tickets/new": "/dashboard/tickets/new",
    "/dashboard/tickets/[id]": "/dashboard/tickets/[id]",
    "/dashboard/rewards": "/dashboard/rewards",
    "/terms": "/terms",
    "/privacy": "/privacy",
    "/cookies": "/cookies",
    "/refund": "/refund",
    "/about": "/about",
    "/faq": "/faq",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
