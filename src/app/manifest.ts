import { type MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let site;
  try {
    site = await getSiteConfig();
  } catch {
    return {
      name: "TodoWP",
      short_name: "TodoWP",
      description: "Premium Digital Marketplace",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#7c3aed",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    };
  }
  return {
    name: site.displayName,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
