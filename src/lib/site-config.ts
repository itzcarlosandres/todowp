import { db } from "@/lib/db";

export async function getSiteConfig() {
  const settings = await db.setting.findMany({
    where: {
      group: { in: ["branding", "seo"] },
    },
  });

  const config: Record<string, string> = {};

  settings.forEach((s) => {
    config[s.key] = s.value as string;
  });

  const rawName = (config.brand_site_name || "").trim() || process.env.NEXT_PUBLIC_APP_NAME || "TodoWP";
  const shortName = (rawName.split("|")[0] ?? "").trim();
  const displayName = rawName;

  const siteDescription =
    (config.brand_site_description || "").trim() ||
    "Marketplace premium de productos digitales.";

  return {
    name: shortName,
    displayName,
    description: siteDescription,
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ogImage: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/og-default.png`,
  };
}
