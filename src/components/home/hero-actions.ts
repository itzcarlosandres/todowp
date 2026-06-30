"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import { mergeHeroConfig, type HeroConfig } from "./hero-config";

const getCachedHeroConfig = unstable_cache(
  async (locale: string): Promise<HeroConfig> => {
    const setting = await db.setting.findUnique({
      where: { key: `hero_config_${locale}` },
    });

    return mergeHeroConfig(locale, setting?.value as HeroConfig | undefined);
  },
  ["hero-config"],
  { revalidate: 60 }
);

export async function getHeroConfig(locale: string): Promise<HeroConfig> {
  return getCachedHeroConfig(locale);
}

export async function saveHeroConfigAction(
  locale: string,
  config: HeroConfig
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
      await db.setting.upsert({
        where: { key: `hero_config_${locale}` },
        update: { value: config as any, group: "hero" },
        create: {
          key: `hero_config_${locale}`,
          value: config as any,
          group: "hero",
          type: "json",
        },
      });

    revalidatePath("/admin/settings");
    revalidatePath("/es", "page");
    revalidatePath("/en", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Save hero config error:", error);
    return { error: "Error al guardar la configuración del Hero." };
  }
}
