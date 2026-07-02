/**
 * Helpers para generar metadata SEO y JSON-LD.
 */
import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";

export interface SeoMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  keywords?: string[];
  locale?: string;
}

export async function generateMetadata(
  seo: SeoMetadata = {},
  locale: string = "es",
): Promise<Metadata> {
  const site = await getSiteConfig();

  const description = seo.description ?? site.description;
  const image = seo.image ?? site.ogImage;
  const url = seo.url ?? site.url;

  const result: Metadata = {
    description,
    keywords: seo.keywords,
    authors: seo.authors ? [{ name: seo.authors.join(", ") }] : undefined,
    creator: site.displayName,
    metadataBase: new URL(site.url),
    alternates: {
      canonical: url,
      languages: {
        es: `${site.url}/es`,
        en: `${site.url}/en`,
      },
    },
    openGraph: {
      type: seo.type ?? "website",
      locale: seo.locale ?? locale,
      url,
      title: seo.title ?? site.displayName,
      description,
      siteName: site.displayName,
      images: [{ url: image, width: 1200, height: 630, alt: seo.title ?? site.displayName }],
      publishedTime: seo.publishedTime,
      modifiedTime: seo.modifiedTime,
      authors: seo.authors,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title ?? site.displayName,
      description,
      images: [image],
      creator: "@todowp",
    },
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };

  if (seo.title) {
    result.title = seo.title;
  }

  return result;
}

export async function getSite() {
  const site = await getSiteConfig();
  return site;
}

export async function organizationJsonLd() {
  const site = await getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.displayName,
    url: site.url,
    logo: `${site.url}/logo.png`,
    description: site.description,
    sameAs: [
      "https://twitter.com/todowp",
      "https://github.com/todowp",
      "https://discord.gg/todowp",
    ],
  };
}

export async function websiteJsonLd() {
  const site = await getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.displayName,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  salePrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  brand?: string;
  sku: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
}

export async function productJsonLd(p: ProductJsonLdInput) {
  const site = await getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    url: p.url,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: p.currency,
      price: p.salePrice ?? p.price,
      availability: `https://schema.org/${p.availability}`,
      seller: { "@type": "Organization", name: site.name },
    },
    aggregateRating:
      p.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export async function articleJsonLd(input: {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
}) {
  const site = await getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt ?? input.publishedAt,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
