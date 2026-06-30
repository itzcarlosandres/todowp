import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Search, FolderTree, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/date";

export const metadata = {
  title: "Categorías | Panel Admin",
};

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const categories = await db.category.findMany({
    take: 50,
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      order: true,
      isActive: true,
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1">Gestiona las categorías de tus productos digitales.</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 size-4" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border/40 flex gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Buscar categoría..." className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay categorías registradas.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex size-10 items-center justify-center rounded-md text-white"
                        style={{ backgroundColor: cat.color || "#7C3AED" }}
                      >
                        <FolderTree className="size-5" />
                      </div>
                      <div className="font-medium">{cat.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cat._count.products}</Badge>
                  </TableCell>
                  <TableCell>{cat.order}</TableCell>
                  <TableCell>
                    {cat.isActive ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Activa</Badge>
                    ) : (
                      <Badge variant="secondary">Inactiva</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Eliminar">
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
