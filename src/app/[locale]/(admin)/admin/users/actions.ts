"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { UserRole, UserStatus } from "@prisma/client";

export async function updateUserRole(userId: string, role: UserRole) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }
  if (session.user.id === userId) {
    return { error: "No puedes cambiar tu propio rol" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar el rol" };
  }
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }
  if (session.user.id === userId) {
    return { error: "No puedes cambiar tu propio estado" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { status },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar el estado" };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }
  if (session.user.id === userId) {
    return { error: "No puedes eliminar tu propia cuenta" };
  }

  try {
    // Note: Due to foreign key constraints, you might need to handle cascading deletes
    // or ensure prisma schema has onDelete: Cascade for user relations.
    // Assuming Prisma schema handles it:
    await db.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el usuario (asegúrate de que no tenga pedidos asociados o que la eliminación en cascada esté habilitada)" };
  }
}
