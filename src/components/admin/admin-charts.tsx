"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface OrderStatusData {
  status: string;
  count: number;
}

interface CategoryData {
  name: string;
  products: number;
}

interface AdminChartsProps {
  revenueData: RevenueDataPoint[];
  orderStatusData: OrderStatusData[];
  categoryData: CategoryData[];
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "#22c55e",
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  FAILED: "#ef4444",
  REFUNDED: "#a855f7",
  CANCELLED: "#6b7280",
};

const CATEGORY_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {entry.name === "revenue" ? formatPrice(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export function AdminCharts({ revenueData, orderStatusData, categoryData }: AdminChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Revenue Area Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
          <CardDescription>Ingresos y pedidos de los últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin datos de ingresos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Ingresos"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradientRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Pedidos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gradientOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Order Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por estado</CardTitle>
          <CardDescription>Distribución actual</CardDescription>
        </CardHeader>
        <CardContent>
          {orderStatusData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin pedidos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {orderStatusData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#6b7280"}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} pedidos`, name]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Productos por categoría</CardTitle>
          <CardDescription>Top categorías con más productos publicados</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin categorías</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                  }}
                />
                <Bar dataKey="products" name="Productos" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
