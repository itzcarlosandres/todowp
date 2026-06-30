import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Simple in-memory rate limit store (works per-isolate in Edge / Node runtime)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 150; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply Rate Limiting to API routes and sensitive paths (anti-brute force / DDoS)
  if (pathname.startsWith("/api") || pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/checkout")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    let requestData = rateLimitMap.get(ip);
    // Cleanup if window expired
    if (!requestData || requestData.lastReset < windowStart) {
      requestData = { count: 1, lastReset: now };
    } else {
      requestData.count++;
    }

    rateLimitMap.set(ip, requestData);

    if (requestData.count > RATE_LIMIT) {
      const retryAfter = Math.ceil((requestData.lastReset + RATE_LIMIT_WINDOW - now) / 1000);
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests - Security Rate Limit Exceeded" }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString()
          } 
        }
      );
    }
  }

  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-DNS-Prefetch-Control", "on");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.headers.set("X-XSS-Protection", "1; mode=block");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // Basic CSP to prevent framing and malicious objects
    res.headers.set("Content-Security-Policy", "frame-ancestors 'self'; object-src 'none'; base-uri 'self';");
    return res;
  };

  // Static & API bypass (after rate limiting)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".") // file
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Handle i18n routing and apply security headers to standard pages
  const response = intlMiddleware(request);
  return applySecurityHeaders(response);
}

export const config = {
  // Run middleware on all paths except _next/static, _vercel, and pure assets. We MUST NOT exclude API so rate limiter works.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
