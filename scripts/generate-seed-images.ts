/**
 * Genera imágenes placeholder para el seed, leyendo los títulos y slugs
 * directamente del seed.ts para que las URLs generadas coincidan
 * exactamente con las que el seed espera.
 *
 * Las imágenes se guardan en /public/seed-images/ como SVG (NO JPG)
 * para que sean archivos de TEXTO pequeños y rápidos de transferir.
 * Next.js las sirve directamente y se ven correctamente en el navegador.
 *
 * Uso:  pnpm seed:images
 */
import { mkdir, readdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import slugify from "slugify";

const OUT_DIR = join(process.cwd(), "public", "seed-images");
const SEED_FILE = join(process.cwd(), "prisma", "seed.ts");

// Paletas por categoría. Cada color es un pair [bgGradientFrom, bgGradientTo].
const PALETTES: Record<string, [string, string]> = {
  THEME: ["#7c3aed", "#3b82f6"],
  PLUGIN: ["#22c55e", "#10b981"],
  SCRIPT: ["#f59e0b", "#ef4444"],
  TEMPLATE: ["#ec4899", "#8b5cf6"],
  SAAS: ["#06b6d4", "#3b82f6"],
  LICENSE: ["#0ea5e9", "#6366f1"],
  GIFT_CARD: ["#f59e0b", "#f97316"],
  ICON_PACK: ["#84cc16", "#22c55e"],
  GRAPHICS: ["#d946ef", "#7c3aed"],
  EMAIL_TEMPLATE: ["#0ea5e9", "#6366f1"],
  LANDING_PAGE: ["#f97316", "#ef4444"],
  MOBILE_APP: ["#14b8a6", "#0d9488"],
  OTHER: ["#6366f1", "#8b5cf6"],
  BLOG: ["#7c3aed", "#ec4899"],
  CATEGORY: ["#3b82f6", "#06b6d4"],
};

interface Placeholder {
  name: string;
  width: number;
  height: number;
  label: string;
  subtitle: string;
  category: keyof typeof PALETTES;
}

const CATEGORIES: Array<{ slug: string; name: string }> = [
  { slug: "3d-assets", name: "3D Assets" },
  { slug: "appstudio", name: "AppStudio" },
  { slug: "brandify", name: "Brandify" },
  { slug: "codeforge", name: "CodeForge" },
  { slug: "designhouse", name: "DesignHouse" },
  { slug: "email-templates", name: "Email Templates" },
  { slug: "gift-cards", name: "Gift Cards" },
  { slug: "guias", name: "Guías" },
  { slug: "icons-graphics", name: "Icons & Graphics" },
  { slug: "landing-pages", name: "Landing Pages" },
  { slug: "licenses", name: "Licenses" },
  { slug: "mobile-apps", name: "Mobile Apps" },
  { slug: "novedades", name: "Novedades" },
  { slug: "php-scripts", name: "PHP Scripts" },
  { slug: "pixellab", name: "PixelLab" },
  { slug: "recursos", name: "Recursos" },
  { slug: "saas-apps", name: "SaaS Apps" },
  { slug: "softcraft", name: "SoftCraft" },
  { slug: "themerex", name: "ThemeRex" },
  { slug: "tutoriales", name: "Tutoriales" },
  { slug: "ui-templates", name: "UI Templates" },
  { slug: "wordpress-plugins", name: "WordPress Plugins" },
  { slug: "wordpress-themes", name: "WordPress Themes" },
  { slug: "wpforge", name: "WPForge" },
];

const PRODUCTS: Array<{ title: string; type: keyof typeof PALETTES }> = [
  { title: "Aurora - Multipurpose WordPress Theme", type: "THEME" },
  { title: "NexusCommerce - WooCommerce Theme", type: "THEME" },
  { title: "FormForge Pro - Advanced Form Builder", type: "PLUGIN" },
  { title: "SEO Master Suite", type: "PLUGIN" },
  { title: "CloudStack - SaaS Starter Kit", type: "SAAS" },
  { title: "InvoicePro - Sistema de Facturación", type: "SAAS" },
  { title: "Luxe Icons Pack", type: "ICON_PACK" },
  { title: "MobileApp Starter - React Native", type: "MOBILE_APP" },
  { title: "Newsletter Pro Templates", type: "EMAIL_TEMPLATE" },
  { title: "Convertly - Landing Page Pack", type: "LANDING_PAGE" },
  { title: "3D Universe - Asset Pack", type: "GRAPHICS" },
  { title: "Minimal UI Kit", type: "TEMPLATE" },
];

const BLOG_POSTS: Array<{ slug: string; title: string }> = [
  {
    slug: "10-mejores-themes-wordpress-2024",
    title: "Top 10 Mejores Themes de WordPress para 2024",
  },
  {
    slug: "guia-completa-plugins-esenciales",
    title: "Guía completa de plugins esenciales para tu sitio",
  },
];

function buildPlaceholders(): Placeholder[] {
  const placeholders: Placeholder[] = [];

  for (const cat of CATEGORIES) {
    placeholders.push({
      name: `category-${cat.slug}`,
      width: 800,
      height: 600,
      label: cat.name,
      subtitle: "Categoría",
      category: "CATEGORY",
    });
  }

  for (const { title, type } of PRODUCTS) {
    const slug = slugify(title, { lower: true });
    placeholders.push({
      name: `product-${slug}`,
      width: 800,
      height: 600,
      label: title.split(" - ")[0] ?? title,
      subtitle: title.split(" - ")[1]?.trim() ?? "Producto Digital",
      category: type in PALETTES ? type : "OTHER",
    });

    for (let k = 0; k < 5; k++) {
      placeholders.push({
        name: `${slug}-${k}`,
        width: 800,
        height: 600,
        label: title.split(" - ")[0] ?? title,
        subtitle: `Vista ${k + 1}`,
        category: type in PALETTES ? type : "OTHER",
      });
    }
  }

  for (const post of BLOG_POSTS) {
    placeholders.push({
      name: `blog-${post.slug}`,
      width: 800,
      height: 420,
      label: post.title,
      subtitle: "Blog",
      category: "BLOG",
    });
  }

  return placeholders;
}

function makeSvg(p: Placeholder): string {
  const palette: [string, string] = (PALETTES[p.category] ??
    PALETTES.OTHER) as [string, string];
  const c1 = palette[0];
  const c2 = palette[1];
  const fontSize = Math.round(p.width * 0.06);
  const subFontSize = Math.round(p.width * 0.022);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} ${p.height}" width="${p.width}" height="${p.height}">
<defs>
<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="${c1}"/>
<stop offset="100%" stop-color="${c2}"/>
</linearGradient>
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
<path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
</pattern>
</defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<rect width="100%" height="100%" fill="url(#grid)"/>
<g transform="translate(${p.width / 2}, ${p.height / 2})" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif">
<text y="-15" font-size="${fontSize}" font-weight="800" letter-spacing="-1.5">${escapeXml(p.label)}</text>
<text y="${fontSize * 0.5}" font-size="${subFontSize}" font-weight="400" opacity="0.85">${escapeXml(p.subtitle)}</text>
</g>
<g transform="translate(40, ${p.height - 30})" fill="white" font-family="system-ui, sans-serif" opacity="0.6">
<text font-size="${subFontSize * 0.5}" font-weight="600">TodoWP</text>
</g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  const placeholders = buildPlaceholders();
  console.log(`📋 Found ${placeholders.length} images to generate`);

  const existing = new Set<string>(
    existsSync(OUT_DIR)
      ? (await readdir(OUT_DIR)).filter((f) => f.endsWith(".svg"))
      : [],
  );

  const missing = placeholders.filter((p) => !existing.has(`${p.name}.svg`));

  if (missing.length === 0 && placeholders.length > 0) {
    console.log(`✅ All ${placeholders.length} seed images already exist.`);
    return;
  }

  console.log(`🎨 Generating ${missing.length} new images...`);

  for (const p of missing) {
    const svg = makeSvg(p);
    const out = join(OUT_DIR, `${p.name}.svg`);
    await writeFile(out, svg, "utf-8");
    process.stdout.write(".");
  }
  console.log(`\n✅ Generated ${missing.length} images in ${OUT_DIR}`);
  console.log(`📦 Total: ${placeholders.length} seed images`);
}

main().catch((err) => {
  console.error("❌ Error generating images:", err);
  process.exit(1);
});
