import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 3600;

function buildXml(entries: MetadataRoute.Sitemap, siteUrl: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="${siteUrl}/sitemap.xsl"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const entry of entries) {
    xml += `  <url>\n`;
    xml += `    <loc>${entry.url}</loc>\n`;
    if (entry.lastModified) {
      const d = entry.lastModified instanceof Date ? entry.lastModified : new Date(entry.lastModified);
      xml += `    <lastmod>${d.toISOString()}</lastmod>\n`;
    }
    if (entry.changeFrequency) xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
    if (entry.priority != null) xml += `    <priority>${entry.priority}</priority>\n`;
    if (entry.alternates?.languages) {
      for (const [lang, href] of Object.entries(entry.alternates.languages)) {
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>\n`;
      }
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export async function GET() {
  const site = await getSiteConfig();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ──
  const staticPaths = [
    { path: "", priority: 1.0, freq: "daily" as const },
    { path: "/products", priority: 0.9, freq: "daily" as const },
    { path: "/blog", priority: 0.8, freq: "weekly" as const },
  ];

  for (const { path, priority, freq } of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: freq,
        priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${site.url}/${l}${path}`]),
          ),
        },
      });
    }
  }

  // ── Info pages ──
  const infoPaths = ["/about", "/terms", "/privacy", "/cookies", "/refund", "/faq"];
  for (const path of infoPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}${path}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      });
    }
  }

  // ── Products ──
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, featured: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  for (const p of products) {
    const priority = p.featured ? 0.8 : 0.6;
    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${site.url}/${l}/product/${p.slug}`]),
          ),
        },
      });
    }
  }

  // ── Categories ──
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  for (const c of categories) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}/products?category=${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      });
    }
  }

  // ── Blog ──
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  for (const p of posts) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${site.url}/${locale}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${site.url}/${l}/blog/${p.slug}`]),
          ),
        },
      });
    }
  }

  const xml = buildXml(entries, site.url);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
