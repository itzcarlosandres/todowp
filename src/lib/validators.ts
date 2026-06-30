import { z } from "zod";

// =====================
// Common
// =====================
export const idSchema = z.string().min(1).max(64);
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug inválido");
export const emailSchema = z.string().email("Email inválido").max(255);
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128, "Máximo 128 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");
export const urlSchema = z.string().url().max(2048).optional().or(z.literal(""));

// =====================
// Pagination
// =====================
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

// =====================
// Product filters
// =====================
export const productFiltersSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z
    .enum(["newest", "oldest", "price-asc", "price-desc", "rating", "popular", "sales"])
    .default("newest"),
  featured: z.coerce.boolean().optional(),
  trending: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  free: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;
