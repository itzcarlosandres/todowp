import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Crown, Trash2, Edit } from "lucide-react";
import { MembershipActions } from "./membership-list-actions";

export const metadata = {
  title: "Membresías de Usuarios | Panel Admin",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminMembershipsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const memberships = await db.userMembership.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membresías de Usuarios</h1>
          <p className="mt-1 text-muted-foreground">Administra quiénes tienen acceso premium.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-brand-500" /> Miembros Activos
          </CardTitle>
          <CardDescription>
            Listado de todos los usuarios con una membresía.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inició</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No hay membresías activas.
                  </TableCell>
                </TableRow>
              ) : (
                memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.user.name}</TableCell>
                    <TableCell>{m.user.email}</TableCell>
                    <TableCell>{m.plan.name}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "ACTIVE" ? "brand" : "outline"}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(m.startsAt).toLocaleDateString()}</TableCell>
                    <TableCell>{m.expiresAt ? new Date(m.expiresAt).toLocaleDateString() : "Nunca (Lifetime)"}</TableCell>
                    <TableCell className="text-right">
                      <MembershipActions membershipId={m.id} currentStatus={m.status} />
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
