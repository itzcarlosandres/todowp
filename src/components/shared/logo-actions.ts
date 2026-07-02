"use server";

import { db } from "@/lib/db";
import { getSiteConfig } from "@/lib/site-config";

export async function getBrandingSettings() {
  const [settings, site] = await Promise.all([
    db.setting.findMany({ where: { group: "branding" } }),
    getSiteConfig(),
  ]);

  const config: Record<string, string> = {
    brand_logo_type: "TEXT",
    brand_logo_text: site.name,
    brand_logo_icon: "ShoppingBag",
    brand_logo_image: "",
    brand_favicon: "",
    brand_logo_size: "md",
    brand_logo_color_from: "#7c3aed",
    brand_logo_color_to: "#a78bfa",
    brand_logo_icon_color: "#ffffff",
    brand_logo_text_color_from: "#1a1a2e",
    brand_logo_text_color_to: "#7c3aed",
    brand_logo_text_size: "2xl",
    brand_logo_bg_style: "gradient",
  };

  settings.forEach((s) => {
    config[s.key] = s.value as string;
  });

  return config;
}
