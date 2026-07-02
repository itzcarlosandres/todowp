import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const [post, categories] = await Promise.all([
    db.blogPost.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } }),
    db.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Editar post</h1>
      <BlogPostForm
        initialData={{
          id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt || "",
          content: post.content, coverImage: post.coverImage || "",
          categoryId: post.categoryId || "", tags: post.tags,
          metaTitle: post.metaTitle || "", metaDescription: post.metaDescription || "",
          status: post.status,
        }}
        categories={categories}
      />
    </>
  );
}
