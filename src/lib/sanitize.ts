/**
 * Sanitiza una cadena de texto para prevenir XSS.
 * Usa DOMPurify del lado del cliente o una versión segura del lado del servidor.
 */
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags ?? [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "img",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
  });
}

export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .trim();
}

/**
 * Sanitiza un objeto recursivamente.
 */
export function sanitize<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
