import type {
  Product,
  Category,
  Brand,
  ProductVersion,
  Review,
} from "@prisma/client";

export type ProductWithRelations = Product & {
  category: Category;
  brand: Brand | null;
  versions: ProductVersion[];
  reviews: (Review & { user: { id: string; name: string | null; image: string | null } })[];
  _count?: {
    reviews: number;
    favorites: number;
    questions: number;
  };
};

export type {
  Product,
  Category,
  Brand,
  ProductVersion,
  Review,
};
