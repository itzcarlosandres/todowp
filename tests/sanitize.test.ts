import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeHtml } from "@/lib/sanitize";

describe("Sanitize", () => {
  describe("sanitizeText", () => {
    it("removes < and >", () => {
      expect(sanitizeText("<script>alert(1)</script>")).not.toContain("<");
    });

    it("removes javascript: protocol", () => {
      expect(sanitizeText("javascript:alert(1)")).not.toContain("javascript:");
    });

    it("handles empty input", () => {
      expect(sanitizeText("")).toBe("");
    });
  });

  describe("sanitizeHtml", () => {
    it("removes dangerous tags", () => {
      const dirty = "<p>Hello</p><script>alert(1)</script>";
      const clean = sanitizeHtml(dirty);
      expect(clean).toContain("<p>");
      expect(clean).not.toContain("<script>");
    });
  });
});
