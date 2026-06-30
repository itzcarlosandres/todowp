import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Search, Percent, Edit, Trash2 } from "lucide-react";
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
  title: "Cupones | Panel Admin",
};

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const coupons = await db.coupon.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cupones de Descuento</h1>
          <p className="text-muted-foreground mt-1">Crea y gestiona códigos promocionales.</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 size-4" />
            Nuevo Cupón
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-border/40 flex gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Buscar por código..." className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Uso</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay cupones registrados.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Percent className="size-4 text-muted-foreground" />
                      <span className="font-mono font-medium">{coupon.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.type === "PERCENTAGE" ? (
                      <Badge variant="outline">{coupon.value.toString()}% OFF</Badge>
                    ) : (
                      <Badge variant="outline">${coupon.value.toString()} OFF</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : "usos"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Sin fecha"}
                  </TableCell>
                  <TableCell>
                    {coupon.isActive ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
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
