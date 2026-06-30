"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleMembershipStatus(membershipId: string, status: "ACTIVE" | "CANCELLED") {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.userMembership.update({
    where: { id: membershipId },
    data: { status }
  });

  revalidatePath("/admin/memberships");
  return { success: true };
}

export async function deleteMembership(membershipId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.userMembership.delete({
    where: { id: membershipId }
  });

  revalidatePath("/admin/memberships");
  return { success: true };
}
