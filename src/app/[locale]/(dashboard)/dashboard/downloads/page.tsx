import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Link as I18nLink } from "@/i18n/routing";
import { formatDate } from "@/lib/date";

export default async function DashboardDownloadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Get all paid orders for this user
  const orders = await db.order.findMany({
    where: { 
      userId: session.user.id,
      status: "PAID"
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              versions: {
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Extract all items
  const purchasedItems = orders.flatMap(order => 
    order.items.map(item => ({
      ...item,
      orderCreatedAt: order.createdAt
    }))
  );

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mis descargas</h1>
      {purchasedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center flex flex-col items-center">
            <p className="text-muted-foreground mb-4">No tienes descargas disponibles todavía.</p>
            <Button asChild variant="brand">
              <I18nLink href="/products">Explorar Productos</I18nLink>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {purchasedItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            const latestVersion = product.versions[0]; // Gets the most recent version

            return (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  <CardDescription>
                    Comprado el {formatDate(item.orderCreatedAt)} · Licencia: {item.license}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between flex-1">
                  <div className="space-y-1">
                    {latestVersion ? (
                      <p className="text-sm font-medium">Versión actual: {latestVersion.version}</p>
                    ) : (
                      <p className="text-sm text-destructive">El archivo no está disponible</p>
                    )}
                  </div>
                  {latestVersion && (
                    <Button asChild variant="brand" size="sm">
                      <a href={`/api/download/${latestVersion.id}`}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
