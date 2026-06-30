import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/shared/section";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/date";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  return buildMetadata({
    title: "Blog",
    description: "Tutoriales, guías y novedades sobre productos digitales",
  });
}

export default async function BlogPage() {
  const t = await getTranslations("nav");
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div className="container-fluid py-12">
      <SectionHeader title="Blog" subtitle="Tutoriales, guías y novedades" />
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Próximamente publicaremos contenido
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="card-hover h-full">
                <CardContent className="space-y-3 p-5">
                  {post.category && (
                    <Badge
                      variant="brand"
                      style={{ backgroundColor: `${post.category.color}15`, color: post.category.color ?? undefined }}
                    >
                      {post.category.name}
                    </Badge>
                  )}
                  <h2 className="line-clamp-2 text-lg font-semibold">{post.title}</h2>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {post.publishedAt ? formatDate(post.publishedAt) : ""} · {post.readTime ?? 5} min
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
