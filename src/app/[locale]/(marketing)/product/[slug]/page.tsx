import * as React from "react";
import {
  getProductBySlug,
  getRelatedProducts,
  incrementViewCount,
} from "@/modules/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { notFound } from "next/navigation";
import { generateMetadata as buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Link as I18nLink } from "@/i18n/routing";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import type { ProductWithRelations } from "@/types/product";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: "Producto no encontrado", noIndex: true });

  return buildMetadata({
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    image: product.ogImage ?? product.coverImage,
    keywords: product.tags,
    type: "website",
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // Increment view count asynchronously
  void incrementViewCount(product.id).catch(() => null);

  const related = await getRelatedProducts(product.id, product.categoryId);

  // Check if user has access (via membership or purchase)
  const { auth } = await import("@/lib/auth");
  const { db } = await import("@/lib/db");
  const session = await auth();

  let hasAccess = false;
  let userHasReviewed = false;
  if (session?.user) {
    // Check membership
    const membership = await db.userMembership.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    });

    // Check if active and not expired
    const isExpired = membership?.expiresAt && membership.expiresAt < new Date();

    if (membership && membership.status === "ACTIVE" && !isExpired && membership.plan) {
      if ((membership.plan.authorizedCategories || []).includes(product.categoryId)) {
        hasAccess = true;
      }
    }

    // Check purchases if no membership access
    if (!hasAccess) {
      const orderCount = await db.order.count({
        where: {
          userId: session.user.id,
          status: "PAID",
          items: { some: { productId: product.id } }
        }
      });
      if (orderCount > 0) hasAccess = true;
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findUnique({
      where: {
        productId_userId: { productId: product.id, userId: session.user.id },
      },
    });
    userHasReviewed = Boolean(existingReview);
  }

  const jsonLd = productJsonLd({
    name: product.title,
    description: product.shortDescription ?? product.description.slice(0, 200),
    image: product.coverImage,
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/product/${product.slug}`,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    currency: product.currency,
    rating: product.rating,
    reviewCount: product.reviewCount,
    brand: product.brand?.name,
    sku: product.id,
    availability: "InStock",
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/` },
    { name: product.category.name, url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/products?category=${product.category.slug}` },
    { name: product.title, url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/product/${product.slug}` },
  ]);

  return (
    <div className="container-fluid py-6 md:py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <I18nLink href="/" className="hover:text-foreground">Inicio</I18nLink>
        <ChevronRight className="size-3" />
        <I18nLink href="/products" className="hover:text-foreground">Marketplace</I18nLink>
        <ChevronRight className="size-3" />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="line-clamp-1 text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ProductGallery
          images={[product.coverImage, ...product.gallery].filter(Boolean)}
          title={product.title}
          video={product.video}
        />
        <div>
          <ProductBuyBox product={product as unknown as ProductWithRelations} hasAccess={hasAccess} />
        </div>
      </div>

      <div className="mt-12">
        <ProductTabs
          product={product as unknown as ProductWithRelations}
          canReview={hasAccess}
          userHasReviewed={userHasReviewed}
          isAuthenticated={Boolean(session?.user)}
        />
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Productos relacionados</h2>
          <ProductGrid products={related as unknown as ProductWithRelations[]} cols={4} />
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </div>
  );
}
