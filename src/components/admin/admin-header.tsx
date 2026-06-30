import Link from "next/link";
import { Store, UserCircle, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-fluid flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <span className="bg-brand-500 text-white rounded p-1 text-xs">A</span>
            Admin Panel
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Store className="size-4" />
            <span className="hidden sm:inline">Ver Tienda</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserCircle className="size-4" />
            <span className="hidden sm:inline">Panel de Cliente</span>
          </Link>
          <div className="w-px h-4 bg-border mx-2"></div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
