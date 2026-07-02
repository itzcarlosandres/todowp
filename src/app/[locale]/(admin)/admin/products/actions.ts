"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    await db.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/admin/products");
    revalidatePath("/sitemap.xml");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el producto." };
  }
}
