"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMembershipSettings() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const plans = await db.membershipPlan.findMany({
    orderBy: { price: "asc" },
  });

  return { plans };
}

export async function saveMembershipSettings(data: {
  plans: { id?: string; name: string; interval: string; price: number; features: string[], authorizedCategories: string[] }[];
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const existingPlans = await db.membershipPlan.findMany();

  // Upsert incoming plans
  for (const p of data.plans) {
    // Try to find an existing plan by ID or by Interval
    const existing = existingPlans.find(ep => ep.id === p.id || ep.interval === p.interval);

    if (existing) {
      await db.membershipPlan.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          price: p.price,
          features: p.features,
          authorizedCategories: p.authorizedCategories || [],
        }
      });
    } else {
      await db.membershipPlan.create({
        data: {
          name: p.name,
          interval: p.interval,
          price: p.price,
          features: p.features,
          authorizedCategories: p.authorizedCategories || [],
        }
      });
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/membership");

  return { success: true };
}
