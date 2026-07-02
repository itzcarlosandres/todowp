import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import { getSiteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
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
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable} ${bricolage.variable}`}>
      <body>{children}</body>
    </html>
  );
}
