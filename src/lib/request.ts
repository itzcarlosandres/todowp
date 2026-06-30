import { cache } from "react";
import { headers } from "next/headers";

/**
 * Obtiene la IP del cliente desde los headers.
 * Memoizado por request.
 */
export const getClientIp = cache(async (): Promise<string | null> => {
  const h = await headers();
  const candidates = [
    h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    h.get("x-real-ip"),
    h.get("cf-connecting-ip"),
    h.get("x-vercel-forwarded-for"),
    h.get("true-client-ip"),
  ];
  return candidates.find((c): c is string => Boolean(c)) ?? null;
});

/**
 * Obtiene el User-Agent del cliente.
 */
export const getUserAgent = cache(async (): Promise<string | null> => {
  const h = await headers();
  return h.get("user-agent");
});

/**
 * Obtiene la URL base del request.
 */
export const getBaseUrl = cache(async (): Promise<string> => {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
});
