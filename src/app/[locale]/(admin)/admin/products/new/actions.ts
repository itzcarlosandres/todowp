"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: { 
  title: string; 
  slug: string; 
  description: string; 
  price: number; 
  categoryId: string; 
  brandId: string | null;
  fileSizeMB: number | null;
  featured: boolean;
  trending: boolean;
  isNew: boolean;
  version: string | null;
  coverImage: string;
  fileKey: string | null;
  metaTitle?: string;
  metaDescription?: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const product = await db.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        coverImage: data.coverImage || `https://picsum.photos/seed/${data.slug}/800/600`,
        status: "PUBLISHED",
        fileSize: data.fileSizeMB ? data.fileSizeMB * 1024 * 1024 : null,
        featured: data.featured,
        trending: data.trending,
        isNew: data.isNew,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    if (data.version && data.fileKey) {
      await db.productVersion.create({
        data: {
          productId: product.id,
          version: data.version,
          changelog: "Versión inicial",
          fileKey: data.fileKey,
          fileName: data.fileKey.split("/").pop() || `${product.slug}-v${data.version}.zip`,
          fileSize: data.fileSizeMB ? data.fileSizeMB * 1024 * 1024 : 0,
          isLatest: true,
        },
      });
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "El slug de producto ya existe." };
    }
    return { error: "Error al crear el producto." };
  }
}
