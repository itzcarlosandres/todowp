import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { generateMetadata as buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

interface PageProps { params: Promise<{ slug: string; locale: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug }, include: { author: true } });
  if (!post) return buildMetadata({ title: "Post no encontrado", noIndex: true });
  return buildMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.ogImage || post.coverImage || undefined,
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: post.author ? [post.author.name || "Autor"] : undefined,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  const ld = articleJsonLd({
    title: post.title,
    description: post.excerpt || post.title,
    image: post.coverImage || `${process.env.NEXT_PUBLIC_APP_URL}/og-default.png`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
    publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    modifiedAt: post.updatedAt.toISOString(),
    authorName: post.author?.name || "TodoWP",
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Inicio", url: process.env.NEXT_PUBLIC_APP_URL || "" },
    { name: "Blog", url: `${process.env.NEXT_PUBLIC_APP_URL}/blog` },
    { name: post.title, url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="container-fluid py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-500">
            <ArrowLeft className="size-3.5" /> Volver al blog
          </Link>

          {post.category && (
            <Badge className="mb-3" style={{ backgroundColor: `${post.category.color || "#7C3AED"}15`, color: post.category.color || "#7C3AED" }}>
              {post.category.name}
            </Badge>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{post.author?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author?.name || "Autor"}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="size-3" />{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{post.readTime || 5} min</span>
              </div>
            </div>
          </div>

          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="mt-8 w-full rounded-2xl object-cover max-h-[400px]" />
          )}

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }} />

          {post.tags.length > 0 && (
            <div className="mt-10">
              <Separator className="mb-4" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t.tag.name} variant="secondary" className="text-xs">{t.tag.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
