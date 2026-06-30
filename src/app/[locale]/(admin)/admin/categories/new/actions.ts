"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(data: { name: string; slug: string; description: string; color: string; order: number }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        order: data.order,
        isActive: true,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "El slug de categoría ya existe." };
    }
    return { error: "Error al crear la categoría." };
  }
}
