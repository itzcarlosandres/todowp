import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div className="container-fluid py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Ajustes</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-20">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rol</span>
                <Badge variant={user.role === "ADMIN" ? "brand" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miembro desde</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">2FA</span>
                <Badge variant={user.twoFactorEnabled ? "success" : "secondary"}>
                  {user.twoFactorEnabled ? "Activado" : "Desactivado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Protege tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">Contraseña</p>
                  <p className="text-xs text-muted-foreground">Última actualización: hace 30 días</p>
                </div>
                <button className="text-sm font-medium text-primary hover:underline">Cambiar</button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">Verificación en dos pasos</p>
                  <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad</p>
                </div>
                <button className="text-sm font-medium text-primary hover:underline">
                  {user.twoFactorEnabled ? "Desactivar" : "Activar"}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Elige qué quieres recibir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Novedades de productos", desc: "Recibe alertas de nuevos productos" },
                { name: "Ofertas y descuentos", desc: "Promociones exclusivas" },
                { name: "Actualizaciones", desc: "Notificaciones de versiones de tus productos" },
              ].map((n) => (
                <div key={n.name} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{n.name}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
