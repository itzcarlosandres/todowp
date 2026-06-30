/**
 * Rate limiter en memoria (para entornos sin Redis).
 * En producción, reemplazar con Upstash Ratelimit.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Identificador único (IP, userId, etc.) */
  key: string;
  /** Número máximo de requests en la ventana */
  limit: number;
  /** Tamaño de la ventana en milisegundos */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const newBucket: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, newBucket);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: newBucket.resetAt,
    };
  }

  if (bucket.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

// Cleanup expired buckets every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt < now) buckets.delete(key);
      }
    },
    5 * 60 * 1000,
  );
}
