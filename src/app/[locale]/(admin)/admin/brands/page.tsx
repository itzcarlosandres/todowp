import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import Link from "next/link";

type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { products: number };
};

export default async function AdminBrandsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  
  const brands: AdminBrand[] = await db.brand.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      website: true,
      isActive: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="container-fluid py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marcas</h1>
          <p className="mt-1 text-muted-foreground">Gestiona las marcas y estudios de la plataforma</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/admin/brands/new">
            <Plus className="size-4" />
            Nueva marca
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las marcas</CardTitle>
          <CardDescription>{brands.length} marcas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {b.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.logo} alt={b.name} className="size-full object-cover" />
                        ) : (
                          <span className="font-semibold">{b.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">/{b.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {b.website ? (
                      <a href={b.website} target="_blank" rel="noreferrer" className="hover:underline">
                        {new URL(b.website).hostname.replace("www.", "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums font-medium">
                    {b._count.products}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.isActive ? "success" : "secondary"}>
                      {b.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(b.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
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
