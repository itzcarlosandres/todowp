import { db } from "@/lib/db";
import { cache } from "@/lib/redis";
import type { Product, Category, Brand } from "@prisma/client";
import type { ProductFilters } from "@/lib/validators";

export type ProductListItem = Product & {
  category: Pick<Category, "id" | "name" | "slug" | "color" | "icon">;
  brand: Pick<Brand, "id" | "name" | "slug" | "logo"> | null;
};

export interface ProductListResult {
  products: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: {
    categories: { id: string; name: string; slug: string; count: number }[];
    brands: { id: string; name: string; slug: string; count: number }[];
    types: { type: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}

const SORT_MAP: Record<string, Record<string, "asc" | "desc">> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  rating: { rating: "desc" },
  popular: { salesCount: "desc" },
  sales: { salesCount: "desc" },
};

export async function getProducts(filters: ProductFilters): Promise<ProductListResult> {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  return cache(cacheKey, async () => {
    const {
      q,
      category,
      brand,
      type,
      minPrice,
      maxPrice,
      rating,
      sort = "newest",
      featured,
      trending,
      isNew,
      page = 1,
      perPage = 20,
    } = filters;

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    const AND: Record<string, unknown>[] = [];

    if (q) {
      AND.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      });
    }

    if (category) {
      const slugs = Array.isArray(category) ? category : [category];
      AND.push({ category: { slug: { in: slugs } } });
    }
    if (brand) {
      const slugs = Array.isArray(brand) ? brand : [brand];
      AND.push({ brand: { slug: { in: slugs } } });
    }
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      AND.push({ type: { in: types } });
    }
    if (minPrice != null || maxPrice != null) {
      where.price = {
        ...(minPrice != null && { gte: minPrice }),
        ...(maxPrice != null && { lte: maxPrice }),
      };
    }
    if (rating != null) {
      where.rating = { gte: rating };
    }
    if (featured) where.featured = true;
    if (trending) where.trending = true;
    if (isNew) where.isNew = true;

    if (AND.length > 0) where.AND = AND;

    const [products, total, categoryAgg, brandAgg, typeAgg, priceAgg] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: SORT_MAP[sort] ?? { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
          brand: { select: { id: true, name: true, slug: true, logo: true } },
        },
      }),
      db.product.count({ where }),
      db.product.groupBy({
        by: ["categoryId"],
        where: { status: "PUBLISHED" },
        _count: { _all: true },
      }),
      db.product.groupBy({
        by: ["brandId"],
        where: { status: "PUBLISHED", brandId: { not: null } },
        _count: { _all: true },
      }),
      db.product.groupBy({
        by: ["type"],
        where: { status: "PUBLISHED" },
        _count: { _all: true },
      }),
      db.product.aggregate({
        where: { status: "PUBLISHED" },
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    const [categories, brands] = await Promise.all([
      db.category.findMany({
        where: { id: { in: categoryAgg.map((c) => c.categoryId) } },
        select: { id: true, name: true, slug: true },
      }),
      db.brand.findMany({
        where: { id: { in: brandAgg.map((b) => b.brandId).filter(Boolean) as string[] } },
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        rating: Number(p.rating),
      })) as unknown as ProductListItem[],
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      facets: {
        categories: categories.map((c) => ({
          ...c,
          count: categoryAgg.find((a) => a.categoryId === c.id)?._count._all ?? 0,
        })),
        brands: brands.map((b) => ({
          ...b,
          count: brandAgg.find((a) => a.brandId === b.id)?._count._all ?? 0,
        })),
        types: typeAgg.map((t) => ({
          type: t.type,
          count: t._count._all,
        })),
        priceRange: {
          min: priceAgg._min.price ? Number(priceAgg._min.price) : 0,
          max: priceAgg._max.price ? Number(priceAgg._max.price) : 100,
        },
      },
    };
  }, 60);
}

export async function getProductBySlug(slug: string) {
  return cache(`product:${slug}`, async () => {
    const product = await db.product.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        category: true,
        brand: true,
        versions: { orderBy: { releasedAt: "desc" } },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: { select: { id: true, name: true, image: true, username: true } },
          },
        },
        _count: { select: { reviews: true, favorites: true, questions: true } },
      },
    });
    if (!product) return null;
    return {
      ...product,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      rating: Number(product.rating),
    };
  }, 60);
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return cache(`related:${productId}`, async () => {
    const products = await db.product.findMany({
      where: {
        status: "PUBLISHED",
        categoryId,
        id: { not: productId },
      },
      orderBy: { salesCount: "desc" },
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
      },
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      rating: Number(p.rating),
    }));
  }, 120);
}

export async function incrementViewCount(productId: string) {
  try {
    await db.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // ignore
  }
}
