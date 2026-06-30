/**
 * Helpers para generar metadata SEO y JSON-LD.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const SITE_NAME = "MarketFlow";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DEFAULT_DESCRIPTION =
  "Marketplace premium de productos digitales: WordPress themes, plugins, scripts PHP, templates UI, SaaS apps y más.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

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
  const t = await getTranslations({ locale, namespace: "common" });

  const title = seo.title ?? t("siteName");
  const description = seo.description ?? DEFAULT_DESCRIPTION;
  const image = seo.image ?? DEFAULT_OG_IMAGE;
  const url = seo.url ?? SITE_URL;

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: seo.keywords,
    authors: seo.authors ? [{ name: seo.authors.join(", ") }] : undefined,
    creator: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        es: `${SITE_URL}/es`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: seo.type ?? "website",
      locale: seo.locale ?? locale,
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: seo.publishedTime,
      modifiedTime: seo.modifiedTime,
      authors: seo.authors,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@marketflow",
    },
    robots: seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export const SITE = {
  name: SITE_NAME,
  url: SITE_URL,
  defaultDescription: DEFAULT_DESCRIPTION,
  defaultOgImage: DEFAULT_OG_IMAGE,
} as const;

// =========================
// JSON-LD generators
// =========================

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      "https://twitter.com/marketflow",
      "https://github.com/marketflow",
      "https://discord.gg/marketflow",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
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

export function productJsonLd(p: ProductJsonLdInput) {
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
      seller: { "@type": "Organization", name: SITE_NAME },
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

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
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

export function articleJsonLd(input: {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
}) {
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
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
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
