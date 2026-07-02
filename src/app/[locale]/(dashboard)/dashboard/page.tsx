import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Download, Heart, DollarSign, ArrowRight, Crown } from "lucide-react";
import { Link as I18nLink } from "@/i18n/routing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  const t = await getTranslations("dashboard");
  const userId = session.user.id;

  const [orderCount, downloadCount, favoriteCount, spentAgg, recentOrders, membership] = await Promise.all([
    db.order.count({ where: { userId, status: "PAID" } }),
    db.download.count({ where: { userId } }),
    db.favorite.count({ where: { userId } }),
    db.order.aggregate({
      where: { userId, status: "PAID" },
      _sum: { total: true },
    }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { take: 3, include: { product: { select: { title: true, slug: true, coverImage: true } } } } },
    }),
    db.userMembership.findUnique({
      where: { userId },
      include: { plan: true }
    })
  ]);

  const stats = [
    { label: t("stats.orders"), value: orderCount, icon: Package, color: "text-brand-500" },
    { label: t("stats.downloads"), value: downloadCount, icon: Download, color: "text-blue-500" },
    { label: t("stats.favorites"), value: favoriteCount, icon: Heart, color: "text-pink-500" },
    { label: t("stats.spent"), value: formatPrice(Number(spentAgg._sum.total ?? 0)), icon: DollarSign, color: "text-green-500" },
  ];

  const getMembershipStatus = () => {
    if (!membership) return { text: "Sin Membresía", color: "text-muted-foreground", bg: "bg-muted" };
    if (membership.status === "CANCELLED") return { text: "Bloqueada/Cancelada", color: "text-destructive", bg: "bg-destructive/10" };
    if (membership.expiresAt && membership.expiresAt < new Date()) return { text: "Expirada", color: "text-destructive", bg: "bg-destructive/10" };
    return { text: "Activa", color: "text-success", bg: "bg-success/10" };
  };
  const mStatus = getMembershipStatus();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome")}, {session.user.name ?? "usuario"} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Aquí tienes un resumen de tu actividad</p>
      </div>

      {membership && (
        <Card className="mb-8 border-brand-500/20 bg-brand-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="size-5 text-brand-500" /> Mi Membresía: {membership.plan.name}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${mStatus.color} ${mStatus.bg}`}>
                {mStatus.text}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Inició:</span> {membership.startsAt.toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Expira:</span> {membership.expiresAt ? membership.expiresAt.toLocaleDateString() : "De por vida"}
                </p>
              </div>
              <Button variant="outline" asChild size="sm">
                <Link href="/membership">Mejorar o Cambiar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${s.color}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos recientes</CardTitle>
              <CardDescription>Tus últimas compras</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <I18nLink href="/dashboard/orders">
                Ver todos <ArrowRight className="ml-1 size-3.5" />
              </I18nLink>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No tienes pedidos aún</p>
            ) : (
              <ul className="space-y-3">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">#{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.items.length} producto{o.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(Number(o.total), { currency: o.currency })}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{o.status.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <I18nLink href="/products">
                <Package className="mr-2 size-4" />
                Explorar marketplace
              </I18nLink>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <I18nLink href="/dashboard/downloads">
                <Download className="mr-2 size-4" />
                Mis descargas
              </I18nLink>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <I18nLink href="/dashboard/settings">
                Configuración
              </I18nLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
