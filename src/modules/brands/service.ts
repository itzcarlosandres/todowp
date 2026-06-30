import { db } from "@/lib/db";
import { cache } from "@/lib/redis";

export async function getBrands() {
  return cache("brands:all", async () => {
    return db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
  }, 300);
}
