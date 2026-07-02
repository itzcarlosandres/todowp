"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { toggleBrandActiveAction, deleteBrandAction } from "@/app/[locale]/(admin)/admin/brands/actions";
import { toast } from "sonner";

export function BrandActions({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/brands/${id}/edit`}><Pencil className="size-4 mr-2" />Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => {
          const res = await toggleBrandActiveAction(id, isActive);
          if (res.error) toast.error(res.error);
          else toast.success(isActive ? "Marca desactivada" : "Marca activada");
        }}>
          {isActive ? <><ToggleRight className="size-4 mr-2" />Desactivar</> : <><ToggleLeft className="size-4 mr-2" />Activar</>}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={async () => {
          const res = await deleteBrandAction(id);
          if (res.error) toast.error(res.error);
          else toast.success("Marca eliminada");
        }}>
          <Trash2 className="size-4 mr-2" />Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
