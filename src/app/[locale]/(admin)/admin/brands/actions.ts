"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBrandAction(id: string, data: { name: string; slug: string; description: string; logo: string; website: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await db.brand.update({ where: { id }, data });
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "El slug ya existe." };
    return { error: "Error al actualizar la marca." };
  }
}

export async function toggleBrandActiveAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await db.brand.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/admin/brands");
  return { success: true };
}

export async function deleteBrandAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2025") return { error: "La marca no existe." };
    return { error: "No se puede eliminar: la marca tiene productos asociados. Desasócialos primero." };
  }
}
