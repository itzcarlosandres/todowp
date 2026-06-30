"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, ShoppingCart, Menu, X, Heart, LayoutDashboard, LogOut, Settings, Home, ShoppingBag, BookOpen, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { Link as I18nLink, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", href: "/", icon: Home },
  { key: "products", href: "/products", icon: ShoppingBag },
  { key: "membership", href: "/membership", icon: Crown },
  { key: "blog", href: "/blog", icon: BookOpen },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const openCart = useCartStore((s) => s.open);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent",
        )}
      >
        <div className="container-fluid flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <I18nLink href="/" className="flex items-center" aria-label="MarketFlow">
              <Logo />
            </I18nLink>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "text-foreground bg-accent/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
                    )}
                  >
                    <Icon className="size-4" />
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label={tCommon("search")}
              asChild
            >
              <I18nLink href="/products">
                <Search className="size-4" />
              </I18nLink>
            </Button>

            <LocaleSwitcher />
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              aria-label="Favoritos"
              asChild
              className="hidden sm:inline-flex"
            >
              <I18nLink href="/dashboard/favorites">
                <Heart className="size-4" />
              </I18nLink>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label={t("cart")}
              onClick={openCart}
              className="relative"
            >
              <ShoppingCart className="size-4" />
              {itemCount > 0 && (
                <Badge
                  variant="brand"
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </Badge>
              )}
            </Button>

            <div className="hidden items-center gap-2 md:flex">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative size-8 rounded-full">
                      <Avatar className="size-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <I18nLink href="/dashboard">
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                      </I18nLink>
                    </DropdownMenuItem>
                    {session.user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 size-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 size-4" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <I18nLink href="/login">{t("login")}</I18nLink>
                  </Button>
                  <Button variant="brand" size="sm" asChild>
                    <I18nLink href="/register">{t("register")}</I18nLink>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-fluid flex flex-col gap-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => toggleMobileMenu()}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {t(item.key)}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border" />
              <I18nLink
                href="/login"
                onClick={() => toggleMobileMenu()}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                <LogOut className="size-4 text-muted-foreground rotate-180" />
                {t("login")}
              </I18nLink>
              <I18nLink
                href="/register"
                onClick={() => toggleMobileMenu()}
                className="rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
              >
                {t("register")}
              </I18nLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
