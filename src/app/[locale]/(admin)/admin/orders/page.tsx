import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusSelect } from "./order-status-select";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/date";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      total: true,
      currency: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="container-fluid py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-muted-foreground">{orders.length} pedidos en total</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los pedidos</CardTitle>
          <CardDescription>Historial completo de pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No hay pedidos todavía
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">#{o.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{o.user?.name ?? o.email}</p>
                        <p className="text-xs text-muted-foreground">{o.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{o._count.items}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatPrice(Number(o.total), { currency: o.currency })}
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
