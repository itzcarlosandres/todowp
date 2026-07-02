import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function NewBlogPostPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const categories = await db.blogCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Nuevo post</h1>
      <BlogPostForm categories={categories} />
    </>
  );
}
