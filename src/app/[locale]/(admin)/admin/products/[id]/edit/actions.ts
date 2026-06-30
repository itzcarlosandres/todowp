"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProductAction(id: string, data: any) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const product = await db.product.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        coverImage: data.coverImage,
        fileSize: data.fileSizeMB ? data.fileSizeMB * 1024 * 1024 : null,
        featured: data.featured,
        trending: data.trending,
        isNew: data.isNew,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: "PUBLISHED",
      },
    });

    if (data.version && data.fileKey) {
      // Create new version
      await db.productVersion.create({
        data: {
          productId: product.id,
          version: data.version,
          changelog: "Actualización",
          fileKey: data.fileKey,
          fileName: data.fileKey.split("/").pop() || `${product.slug}-v${data.version}.zip`,
          fileSize: data.fileSizeMB ? data.fileSizeMB * 1024 * 1024 : 0,
          isLatest: true,
        },
      });
      
      // Mark others as not latest
      await db.productVersion.updateMany({
        where: { productId: product.id, version: { not: data.version } },
        data: { isLatest: false }
      });
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "El slug de producto ya existe." };
    }
    return { error: "Error al actualizar el producto." };
  }
}
