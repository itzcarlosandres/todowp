"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveSettingsAction(group: string, data: Record<string, any>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    for (const [key, value] of Object.entries(data)) {
      await db.setting.upsert({
        where: { key },
        update: { value, group },
        create: { key, value, group },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout"); // Revalidate public layout in case branding changes
    return { success: true };
  } catch (error: any) {
    console.error("Save settings error:", error);
    return { error: "Error al guardar la configuración." };
  }
}
