"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBlogPostAction(data: {
  title: string; slug: string; excerpt: string; content: string;
  coverImage: string; categoryId: string; tags: string[];
  metaTitle: string; metaDescription: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    const post = await db.blogPost.create({
      data: {
        title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.content,
        contentHtml: data.content, coverImage: data.coverImage,
        authorId: session.user.id, categoryId: data.categoryId || null,
        status: data.status, readTime: Math.ceil(data.content.length / 1500),
        metaTitle: data.metaTitle || null, metaDescription: data.metaDescription || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        tags: data.tags.length > 0
          ? { create: data.tags.filter(Boolean).map((t) => ({
              tag: {
                connectOrCreate: { where: { slug: t.toLowerCase().replace(/\s+/g, "-") }, create: { slug: t.toLowerCase().replace(/\s+/g, "-"), name: t } },
              },
            })) }
          : undefined,
      },
    });
    revalidatePath("/admin/blog");
    return { success: true, postId: post.id };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe" };
    return { error: "Error al crear el post" };
  }
}

export async function updateBlogPostAction(id: string, data: {
  title: string; slug: string; excerpt: string; content: string;
  coverImage: string; categoryId: string; tags: string[];
  metaTitle: string; metaDescription: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "Post no encontrado" };

  try {
    // Remove old tags
    await db.blogPostTag.deleteMany({ where: { postId: id } });

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.content,
        contentHtml: data.content, coverImage: data.coverImage,
        categoryId: data.categoryId || null, status: data.status,
        readTime: Math.ceil(data.content.length / 1500),
        metaTitle: data.metaTitle || null, metaDescription: data.metaDescription || null,
        publishedAt: data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        tags: data.tags.length > 0
          ? { create: data.tags.filter(Boolean).map((t) => ({
              tag: {
                connectOrCreate: { where: { slug: t.toLowerCase().replace(/\s+/g, "-") }, create: { slug: t.toLowerCase().replace(/\s+/g, "-"), name: t } },
              },
            })) }
          : undefined,
      },
    });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe" };
    return { error: "Error al actualizar el post" };
  }
}

export async function deleteBlogPostAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };
  try {
    await db.blogPost.delete({ where: { id } });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch { return { error: "Error al eliminar" }; }
}

export async function toggleBlogPostStatusAction(id: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };
  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  try {
    await db.blogPost.update({
      where: { id },
      data: { status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date() : undefined },
    });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch { return { error: "Error al cambiar estado" }; }
}
