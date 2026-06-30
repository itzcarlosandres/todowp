"use server";

import { db } from "@/lib/db";

export async function getBrandingSettings() {
  const settings = await db.setting.findMany({
    where: { group: "branding" },
  });

  const config: Record<string, string> = {
    brand_logo_type: "TEXT",
    brand_logo_text: "MarketFlow",
    brand_logo_icon: "ShoppingBag",
    brand_logo_image: "",
    brand_favicon: "",
  };

  settings.forEach((s) => {
    config[s.key] = s.value as string;
  });

  return config;
}
