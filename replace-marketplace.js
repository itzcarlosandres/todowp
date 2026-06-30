const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/i18n/routing.ts",
  "src/lib/seo.ts",
  "src/components/layout/cart-drawer.tsx",
  "src/components/layout/footer.tsx",
  "src/components/layout/header.tsx",
  "src/components/home/category-grid.tsx",
  "src/components/home/cta-section.tsx",
  "src/app/sitemap.ts",
  "src/app/[locale]/(marketing)/products/page.tsx",
  "src/app/[locale]/(dashboard)/dashboard/page.tsx",
  "src/app/[locale]/(marketing)/product/[slug]/page.tsx",
  "src/app/[locale]/(marketing)/page.tsx",
  "src/app/[locale]/(marketing)/pricing/page.tsx",
  "src/app/[locale]/not-found.tsx",
  "src/app/[locale]/(dashboard)/dashboard/downloads/page.tsx",
  "src/components/home/hero-section.tsx",
  "src/app/[locale]/(checkout)/cart/page.tsx"
];

const basePath = "c:\\Users\\El Picho\\Documents\\Proyectos NextJS\\todowp";

filesToUpdate.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\/marketplace\?/g, '/products?');
    content = content.replace(/\/marketplace/g, '/products');
    content = content.replace(/"marketplace"/g, '"products"'); // mostly for i18n keys if they refer to the url
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
