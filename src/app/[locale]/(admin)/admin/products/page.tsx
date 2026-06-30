import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProductActionsMenu } from "./product-actions-menu";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const products = await db.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      coverImage: true,
      status: true,
      featured: true,
      trending: true,
      isNew: true,
      salesCount: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });

  return (
    <div className="container-fluid py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-muted-foreground">Gestiona el catálogo de productos</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los productos</CardTitle>
          <CardDescription>{products.length} productos en total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.coverImage} alt={p.title} className="size-full object-cover" />
                      </div>
                      <div>
                        <p className="line-clamp-1 font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.brand?.name ?? "—"}</p>
                        <div className="flex gap-1 mt-1">
                          {p.isNew && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Nuevo</Badge>}
                          {p.featured && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Destacado</Badge>}
                          {p.trending && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-orange-200 text-orange-600 bg-orange-50">Tendencia</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.category?.name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatPrice(Number(p.price), { currency: p.currency })}
                  </TableCell>
                  <TableCell className="tabular-nums">{p.salesCount}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{formatDate(p.createdAt)}</span>
                      {p.updatedAt > p.createdAt && (
                        <span className="text-[10px] text-muted-foreground/70">
                          Act: {formatDate(p.updatedAt)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductActionsMenu
                      productId={p.id}
                      productTitle={p.title}
                      productSlug={p.slug}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
