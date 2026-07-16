import type { Metadata, Viewport } from "next";
import { getSiteConfig } from "@/lib/site-config";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  try {
    const faviconSettings = await import("@/lib/db").then((m) =>
      m.db.setting.findMany({ where: { key: { in: ["brand_favicon"] } } }),
    );
    const favicon = faviconSettings.find((s) => s.key === "brand_favicon")?.value as string | undefined;
    return {
      title: { default: site.name, template: `%s | ${site.name}` },
      description: site.description,
      metadataBase: new URL(site.url),
      icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    };
  } catch {
    return {
      title: { default: site.name, template: `%s | ${site.name}` },
      description: site.description,
      metadataBase: new URL(site.url),
    };
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
