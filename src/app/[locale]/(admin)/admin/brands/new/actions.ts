"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBrandAction(data: { name: string; slug: string; description: string; logo: string; website: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const brand = await db.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        website: data.website,
        isActive: true,
      },
    });

    revalidatePath("/admin/brands");
    return { success: true, brand };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "El slug ya existe." };
    }
    return { error: "Error al crear la marca." };
  }
}
