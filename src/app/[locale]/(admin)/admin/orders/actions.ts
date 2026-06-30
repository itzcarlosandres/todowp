"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return { error: "Pedido no encontrado" };
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
    });
    
    // Si se marcó como pagado y es una membresía, activarla manualmente
    if (status === "PAID") {
      const metadata = updatedOrder.metadata as any;
      if (metadata && metadata.isMembership && metadata.planId && updatedOrder.userId) {
        const { activateMembershipForUser } = await import("@/lib/membership");
        await activateMembershipForUser(metadata.planId, updatedOrder.userId);
      }
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { error: "Error al actualizar el estado del pedido" };
  }
}
