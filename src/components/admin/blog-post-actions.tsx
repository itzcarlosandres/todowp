"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { toggleBlogPostStatusAction, deleteBlogPostAction } from "@/app/[locale]/(admin)/admin/blog/actions";
import { toast } from "sonner";

export function BlogPostActions({ id, status }: { id: string; status: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/blog/${id}/edit`}><Pencil className="size-4 mr-2" />Editar</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => {
          const res = await toggleBlogPostStatusAction(id, status);
          if (res.error) toast.error(res.error);
          else toast.success(status === "PUBLISHED" ? "Movido a borrador" : "Publicado");
        }}>
          {status === "PUBLISHED" ? <><ToggleRight className="size-4 mr-2" />Despublicar</> : <><ToggleLeft className="size-4 mr-2" />Publicar</>}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={async () => {
          const res = await deleteBlogPostAction(id);
          if (res.error) toast.error(res.error);
          else toast.success("Post eliminado");
        }}>
          <Trash2 className="size-4 mr-2" />Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
