import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { Package } from "lucide-react";

export default async function OrdersPage() {
  const t = await getTranslations("dashboard.orders");
  const session = await auth();
  if (!session?.user) return null;
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">#{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                  </div>
                  <Badge variant={o.status === "PAID" ? "success" : "secondary"}>
                    {o.status}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatPrice(Number(o.total), { currency: o.currency })}
                    </p>
                    <p className="text-xs text-muted-foreground">{o.items.length} productos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
