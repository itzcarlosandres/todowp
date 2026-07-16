import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from "lucide-react";
import { unstable_cache } from "next/cache";
import { AdminCharts } from "@/components/admin/admin-charts";

const getDashboardStats = unstable_cache(
  async () => {
    const [
      revenueAgg,
      ordersCount,
      usersCount,
      productsCount,
    ] = await Promise.all([
      db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
      db.order.count(),
      db.user.count(),
      db.product.count({ where: { status: "PUBLISHED" } }),
    ]);

    return {
      revenue: Number(revenueAgg._sum.total ?? 0),
      orders: ordersCount,
      users: usersCount,
      products: productsCount,
    };
  },
  ["admin-dashboard-stats"],
  { revalidate: 60 }
);

const getRecentOrders = unstable_cache(
  async () => {
    return db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    });
  },
  ["admin-recent-orders"],
  { revalidate: 60 }
);

const getTopProducts = unstable_cache(
  async () => {
    return db.product.findMany({
      orderBy: { salesCount: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        salesCount: true,
        price: true,
        currency: true,
      },
    });
  },
  ["admin-top-products"],
  { revalidate: 60 }
);

const getRevenueChart = unstable_cache(
  async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap: Record<string, { revenue: number; orders: number }> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { revenue: 0, orders: 0 };
    }

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, orders: 0 };
      dailyMap[key].orders += 1;
      if (o.status === "PAID") {
        dailyMap[key].revenue += Number(o.total);
      }
    }

    return Object.entries(dailyMap).map(([date, data]) => ({
      date: date.slice(5),
      revenue: data.revenue,
      orders: data.orders,
    }));
  },
  ["admin-revenue-chart"],
  { revalidate: 120 }
);

const getOrderStatusData = unstable_cache(
  async () => {
    const groups = await db.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    return groups.map((g) => ({
      status: g.status,
      count: g._count.status,
    }));
  },
  ["admin-order-status"],
  { revalidate: 120 }
);

const getCategoryData = unstable_cache(
  async () => {
    const categories = await db.category.findMany({
      where: { parentId: null },
      select: {
        name: true,
        _count: { select: { products: true } },
      },
      orderBy: { products: { _count: "desc" } },
      take: 8,
    });
    return categories.map((c) => ({
      name: c.name,
      products: c._count.products,
    }));
  },
  ["admin-category-chart"],
  { revalidate: 120 }
);

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const [statsData, recentOrders, topProducts, revenueData, orderStatusData, categoryData] =
    await Promise.all([
      getDashboardStats(),
      getRecentOrders(),
      getTopProducts(),
      getRevenueChart(),
      getOrderStatusData(),
      getCategoryData(),
    ]);

  const stats = [
    { label: "Ingresos totales", value: formatPrice(statsData.revenue), icon: DollarSign, change: "+12.5%" },
    { label: "Pedidos", value: statsData.orders, icon: ShoppingCart, change: "+8.2%" },
    { label: "Usuarios", value: statsData.users, icon: Users, change: "+24.1%" },
    { label: "Productos", value: statsData.products, icon: Package, change: "+3" },
  ];

  return (
    <div className="container-fluid py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Panel de administración</h1>
        <p className="mt-1 text-muted-foreground">Resumen de tu marketplace</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="size-3" />
                      {s.change}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <AdminCharts
          revenueData={revenueData}
          orderStatusData={orderStatusData}
          categoryData={categoryData}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin pedidos</p>
            ) : (
              <ul className="space-y-3">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">#{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.user?.name ?? o.user?.email ?? "Usuario eliminado"} · {o._count.items} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatPrice(Number(o.total))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
            <CardDescription>Top 5 por ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topProducts.map((p, idx) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.salesCount} ventas</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrice(Number(p.price))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
