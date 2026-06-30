"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "./actions";

interface ProductActionsMenuProps {
  productId: string;
  productTitle: string;
  productSlug: string;
}

export function ProductActionsMenu({ productId, productTitle, productSlug }: ProductActionsMenuProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${productTitle}"?`)) return;

    setLoading(true);
    const res = await deleteProductAction(productId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Producto eliminado exitosamente");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" disabled={loading}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}/edit`} className="cursor-pointer">
            <Edit className="mr-2 size-4" /> Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/product/${productSlug}`} target="_blank" className="cursor-pointer">
            <Eye className="mr-2 size-4" /> Ver en tienda
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
        >
          <Trash2 className="mr-2 size-4" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
