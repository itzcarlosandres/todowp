import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteConfig();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/", "/_next/", "/private/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/"] },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
