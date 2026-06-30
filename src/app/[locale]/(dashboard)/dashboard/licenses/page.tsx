import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

export default async function DashboardLicensesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const licenses = await db.license.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div className="container-fluid py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mis licencias</h1>
      {licenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tienes licencias todavía</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {licenses.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{l.product.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono">{l.key}</code>
                      <button className="text-muted-foreground hover:text-foreground" aria-label="Copiar">
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{l.type}</Badge>
                    <Badge variant={l.status === "ACTIVE" ? "success" : "secondary"}>
                      {l.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
