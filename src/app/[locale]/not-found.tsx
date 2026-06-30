"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-8xl font-bold leading-none gradient-text">404</div>
        <h1 className="text-2xl font-bold tracking-tight">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="brand" asChild>
            <Link href="/">
              <Home className="size-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">
              <Search className="size-4" />
              Explorar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
