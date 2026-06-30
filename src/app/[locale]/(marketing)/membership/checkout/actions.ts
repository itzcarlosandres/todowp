"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { activateMembershipForUser } from "@/lib/membership";

export async function activateMembership(planId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const result = await activateMembershipForUser(planId, session.user.id);
    
    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/admin/memberships");
    }
    return result;
  } catch (error: any) {
    console.error("Activate Membership Error:", error);
    return { error: "Error interno del servidor" };
  }
}
