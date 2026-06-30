import slugify from "slugify";

export function slugifyString(input: string): string {
  return slugify(input, { lower: true, strict: true, locale: "es" });
}

export function generateLicenseKey(prefix = "MKT"): string {
  const segments = [
    prefix,
    randomSegment(4),
    randomSegment(4),
    randomSegment(4),
    randomSegment(4),
  ];
  return segments.join("-");
}

function randomSegment(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `MF${year}${month}-${random}`;
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(6, "0");
  return `INV-${year}-${random}`;
}

export function generateDownloadToken(): string {
  return Array.from({ length: 48 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 62),
    ),
  ).join("");
}
