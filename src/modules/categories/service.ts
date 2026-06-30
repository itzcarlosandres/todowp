import { db } from "@/lib/db";
import { cache } from "@/lib/redis";

export async function getCategories() {
  return cache("categories:all", async () => {
    return db.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
  }, 300);
}

export async function getCategoryBySlug(slug: string) {
  return cache(`category:${slug}`, async () => {
    return db.category.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: { select: { products: true } },
        children: true,
      },
    });
  }, 300);
}
