import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url;
  const now = new Date();

  // Static pages
  const staticPages = ["", "/products", "/blog"].flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
        ),
      },
    })),
  );

  // Products
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const productPages = products.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  // Categories
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categoryPages = categories.flatMap((c) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/products?category=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  // Blog posts
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const blogPages = posts.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  );

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
