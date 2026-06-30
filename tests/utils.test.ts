import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { formatPrice as fp, discountPercent } from "@/lib/format";
import { slugifyString } from "@/lib/generate";

describe("Utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("a", "b")).toBe("a b");
      expect(cn("a", false && "b", "c")).toBe("a c");
    });
  });

  describe("formatPrice", () => {
    it("formats USD price", () => {
      const result = fp(99.99, { currency: "USD", locale: "es-ES" });
      expect(result).toContain("99");
    });

    it("handles null", () => {
      expect(fp(null)).toBe("—");
      expect(fp(undefined)).toBe("—");
    });
  });

  describe("discountPercent", () => {
    it("calculates percentage", () => {
      expect(discountPercent(100, 50)).toBe(50);
      expect(discountPercent(80, 60)).toBe(25);
    });

    it("returns 0 for invalid values", () => {
      expect(discountPercent(0, 50)).toBe(0);
      expect(discountPercent(100, 100)).toBe(0);
      expect(discountPercent(100, 150)).toBe(0);
    });
  });

  describe("slugifyString", () => {
    it("creates URL-safe slugs", () => {
      expect(slugifyString("Hello World")).toBe("hello-world");
      expect(slugifyString("Café & Té")).toMatch(/cafe/);
    });
  });
});
