import { db } from "@/lib/db";

export async function activateMembershipForUser(planId: string, userId: string) {
  try {
    const plan = await db.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      throw new Error("Plan inválido o inactivo");
    }

    // Calculate expiration date
    let expiresAt: Date | null = new Date();
    if (plan.interval === "month") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.interval === "year") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt = null; // lifetime
    }

    // Upsert user membership
    await db.userMembership.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        startsAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: new Date(),
        expiresAt,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Activate Membership Error:", error);
    return { error: error.message || "Error interno del servidor" };
  }
}
