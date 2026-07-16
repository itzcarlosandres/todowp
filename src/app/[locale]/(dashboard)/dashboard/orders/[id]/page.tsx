import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { Link as I18nLink } from "@/i18n/routing";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("dashboard.orders");
  const session = await auth();
  if (!session?.user) return null;

  const order = await db.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <I18nLink href="/dashboard/orders">
            <ArrowLeft className="size-4" />
          </I18nLink>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedido #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.license === "SINGLE" ? "Licencia única" : "Licencia ilimitada"} · Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatPrice(Number(item.price), { currency: order.currency })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity > 1 && `${item.quantity} × ${formatPrice(Number(item.price) / item.quantity, { currency: order.currency })}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant={order.status === "PAID" ? "success" : order.status === "FAILED" ? "destructive" : "secondary"}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Método de pago</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cupón</span>
                  <span className="font-medium text-brand-500">{order.couponCode}</span>
                </div>
              )}
              <div className="border-t border-border/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(Number(order.subtotal), { currency: order.currency })}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-success tabular-nums">
                      -{formatPrice(Number(order.discount), { currency: order.currency })}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(Number(order.total), { currency: order.currency })}</span>
              </div>
            </CardContent>
          </Card>

          {order.status === "PAID" && (
            <Card>
              <CardHeader>
                <CardTitle>Descargas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                        <I18nLink href={`/dashboard/downloads`}>
                          <Download className="size-3.5" />
                          {item.product.title}
                        </I18nLink>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
