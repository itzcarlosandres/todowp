import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BlogPostActions } from "@/components/admin/blog-post-actions";

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [posts, categories] = await Promise.all([
    db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { category: { select: { name: true } }, tags: { select: { tag: { select: { name: true } } } }, author: { select: { name: true } } },
    }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="mt-1 text-muted-foreground">Gestiona el contenido del blog</p>
        </div>
        <Button variant="brand" asChild>
          <Link href="/admin/blog/new"><Plus className="size-4" /> Nuevo post</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los posts</CardTitle>
          <CardDescription>{posts.length} posts en total</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">/{p.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "PUBLISHED" ? "success" : p.status === "DRAFT" ? "warning" : "secondary"}>
                      {p.status === "PUBLISHED" ? "Publicado" : p.status === "DRAFT" ? "Borrador" : "Archivado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.author?.name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <BlogPostActions id={p.id} status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
