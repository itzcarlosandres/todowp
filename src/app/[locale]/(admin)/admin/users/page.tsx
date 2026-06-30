import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { UserActionsMenu } from "./user-actions-menu";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="container-fluid py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-muted-foreground">{users.length} usuarios registrados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los usuarios</CardTitle>
          <CardDescription>Gestiona los usuarios del marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={u.image ?? undefined} />
                        <AvatarFallback>{u.name?.charAt(0) ?? "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "brand" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{u._count.orders}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === "ACTIVE"
                          ? "success"
                          : u.status === "BLOCKED"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    <UserActionsMenu
                      userId={u.id}
                      currentRole={u.role}
                      currentStatus={u.status}
                      userName={u.name ?? u.email}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
