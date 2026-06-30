import { PrismaClient, ProductType, ProductStatus, UserRole } from "@prisma/client";
import { hash } from "argon2";
import slugify from "slugify";

// Ensure we use the generated client
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.question.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.download.deleteMany(),
    prisma.activation.deleteMany(),
    prisma.license.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productVersion.deleteMany(),
    prisma.productTag.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.blogPostTag.deleteMany(),
    prisma.blogComment.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.blogCategory.deleteMany(),
    prisma.blogTag.deleteMany(),
    prisma.ticketMessage.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.newsletter.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.twoFactorConfirmation.deleteMany(),
    prisma.user.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.emailTemplate.deleteMany(),
    prisma.paymentProvider.deleteMany(),
  ]);

  // =========================
  // USERS
  // =========================
  console.log("👤 Creating users...");

  const adminPassword = await hash("admin123456");
  const userPassword = await hash("user123456");

  const admin = await prisma.user.create({
    data: {
      email: "admin@marketflow.dev",
      name: "Admin",
      username: "admin",
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
      emailVerified: new Date(),
      bio: "Marketplace administrator",
    },
  });

  const users = await Promise.all(
    [
      { email: "ana@example.com", name: "Ana García", username: "anagarcia" },
      { email: "carlos@example.com", name: "Carlos López", username: "carloslopez" },
      { email: "maria@example.com", name: "María Rodríguez", username: "mariarodriguez" },
      { email: "david@example.com", name: "David Martín", username: "davidmartin" },
      { email: "laura@example.com", name: "Laura Sánchez", username: "laurasanchez" },
    ].map((u) =>
      prisma.user.create({
        data: {
          ...u,
          role: UserRole.USER,
          passwordHash: userPassword,
          emailVerified: new Date(),
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        },
      }),
    ),
  );

  // =========================
  // CATEGORIES
  // =========================
  console.log("📁 Creating categories...");

  const categoriesData = [
    {
      name: "WordPress Themes",
      slug: "wordpress-themes",
      description: "Premium themes para WordPress con diseños modernos",
      icon: "Palette",
      color: "#7C3AED",
      order: 1,
      metaTitle: "WordPress Themes Premium | MarketFlow",
      metaDescription:
        "Descubre los mejores themes de WordPress para crear sitios web profesionales, blogs, tiendas y más.",
    },
    {
      name: "WordPress Plugins",
      slug: "wordpress-plugins",
      description: "Plugins profesionales para extender WordPress",
      icon: "Puzzle",
      color: "#10B981",
      order: 2,
      metaTitle: "WordPress Plugins Premium | MarketFlow",
    },
    {
      name: "UI Templates",
      slug: "ui-templates",
      description: "Templates y kits de UI para Figma, Sketch, XD",
      icon: "Layout",
      color: "#3B82F6",
      order: 3,
    },
    {
      name: "PHP Scripts",
      slug: "php-scripts",
      description: "Scripts PHP completos para tus proyectos",
      icon: "Code2",
      color: "#F59E0B",
      order: 4,
    },
    {
      name: "SaaS Apps",
      slug: "saas-apps",
      description: "Aplicaciones SaaS listas para producción",
      icon: "Cloud",
      color: "#06B6D4",
      order: 5,
    },
    {
      name: "Mobile Apps",
      slug: "mobile-apps",
      description: "Apps nativas e híbridas para iOS y Android",
      icon: "Smartphone",
      color: "#EC4899",
      order: 6,
    },
    {
      name: "Icons & Graphics",
      slug: "icons-graphics",
      description: "Iconos, ilustraciones y assets gráficos",
      icon: "Sparkles",
      color: "#F97316",
      order: 7,
    },
    {
      name: "Email Templates",
      slug: "email-templates",
      description: "Plantillas de email HTML responsive",
      icon: "Mail",
      color: "#EF4444",
      order: 8,
    },
    {
      name: "Landing Pages",
      slug: "landing-pages",
      description: "Landing pages de alta conversión",
      icon: "Rocket",
      color: "#8B5CF6",
      order: 9,
    },
    {
      name: "3D Assets",
      slug: "3d-assets",
      description: "Modelos 3D, renders y materiales",
      icon: "Box",
      color: "#14B8A6",
      order: 10,
    },
    {
      name: "Licenses",
      slug: "licenses",
      description: "Licencias de software premium",
      icon: "Key",
      color: "#6366F1",
      order: 11,
    },
    {
      name: "Gift Cards",
      slug: "gift-cards",
      description: "Tarjetas de regalo digitales",
      icon: "Gift",
      color: "#F43F5E",
      order: 12,
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.category.create({
        data: {
          ...c,
          image: `https://picsum.photos/seed/${c.slug}/800/600`,
        },
      }),
    ),
  );

  // =========================
  // BRANDS
  // =========================
  console.log("🏷️ Creating brands...");

  const brandsData = [
    { name: "ThemeRex", slug: "themerex", website: "https://themerex.example" },
    { name: "SoftCraft", slug: "softcraft", website: "https://softcraft.example" },
    { name: "PixelLab", slug: "pixellab", website: "https://pixellab.example" },
    { name: "CodeForge", slug: "codeforge", website: "https://codeforge.example" },
    { name: "AppStudio", slug: "appstudio", website: "https://appstudio.example" },
    { name: "Brandify", slug: "brandify", website: "https://brandify.example" },
    { name: "DesignHouse", slug: "designhouse", website: "https://designhouse.example" },
    { name: "WPForge", slug: "wpforge", website: "https://wpforge.example" },
  ];

  const brands = await Promise.all(
    brandsData.map((b) =>
      prisma.brand.create({
        data: {
          ...b,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${b.name}&backgroundColor=7C3AED`,
          description: `${b.name} is a premium digital product studio.`,
        },
      }),
    ),
  );

  // =========================
  // TAGS
  // =========================
  console.log("🏷️ Creating tags...");

  const tagNames = [
    "responsive",
    "dark-mode",
    "rtl",
    "woocommerce",
    "seo",
    "performance",
    "accessibility",
    "animation",
    "minimal",
    "modern",
    "creative",
    "ecommerce",
    "portfolio",
    "blog",
    "agency",
    "saas",
  ];

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: {
          name,
          slug: slugify(name, { lower: true }),
        },
      }),
    ),
  );

  // =========================
  // PRODUCTS
  // =========================
  console.log("📦 Creating products...");

  type ProductSeed = {
    title: string;
    description: string;
    shortDescription: string;
    type: ProductType;
    categorySlug: string;
    brandSlug: string;
    price: number;
    salePrice?: number;
    features: string[];
    compatibility: string[];
    featured?: boolean;
    trending?: boolean;
    isNew?: boolean;
    rating: number;
    reviewCount: number;
    salesCount: number;
    versions: { version: string; changelog: string; releasedAt: Date }[];
    reviews: { rating: number; title: string; body: string; userId: string; verified: boolean }[];
  };

  const products: ProductSeed[] = [
    {
      title: "Aurora - Multipurpose WordPress Theme",
      description: `Aurora es un theme premium de WordPress diseñado para crear sitios web modernos y profesionales. Perfecto para agencias, freelancers, startups y empresas creativas.

## Características principales

- **Diseño responsive** que se adapta a todos los dispositivos
- **Más de 30 demos** listas para importar con un click
- **Constructor visual** integrado con WPBakery
- **Optimizado para SEO** y velocidad de carga
- **Compatible con WooCommerce** para crear tiendas online
- **Soporte para WPML** y traducción a múltiples idiomas
- **Actualizaciones de por vida** con nuevas funcionalidades

## ¿Qué incluye?

- Theme principal
- Child theme
- Todos los archivos de demos
- Documentación detallada
- Soporte premium por 6 meses
- Licencia para un sitio web`,
      shortDescription:
        "Theme multipropósito premium con 30+ demos, constructor visual y diseño moderno.",
      type: ProductType.THEME,
      categorySlug: "wordpress-themes",
      brandSlug: "themerex",
      price: 79,
      salePrice: 59,
      features: [
        "30+ demos predefinidas",
        "Constructor visual WPBakery",
        "100% responsive",
        "Optimizado para SEO",
        "Compatible con WooCommerce",
        "Soporte WPML",
        "Actualizaciones de por vida",
      ],
      compatibility: ["WordPress 6.0+", "PHP 8.0+", "MySQL 5.7+"],
      featured: true,
      trending: true,
      rating: 4.9,
      reviewCount: 248,
      salesCount: 3420,
      versions: [
        {
          version: "2.4.0",
          changelog:
            "## 2.4.0 - 2024-12-15\n\n### Nuevas funcionalidades\n- Nuevo demo 'Restaurant'\n- Soporte para WordPress 6.7\n- Mejoras de rendimiento\n\n### Correcciones\n- Fix responsive en iPad\n- Fix traducciones en WPML",
          releasedAt: new Date("2024-12-15"),
        },
        {
          version: "2.3.0",
          changelog:
            "## 2.3.0 - 2024-10-20\n\n### Nuevas funcionalidades\n- Nuevo demo 'Medical'\n- Soporte para WooCommerce 9.0\n\n### Mejoras\n- Mejor compatibilidad con caché",
          releasedAt: new Date("2024-10-20"),
        },
        {
          version: "2.2.0",
          changelog:
            "## 2.2.0 - 2024-08-05\n\n### Nuevas funcionalidades\n- Nuevo header builder\n- 5 nuevos iconos",
          releasedAt: new Date("2024-08-05"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Excelente theme, muy completo",
          body: "Lo uso en varios proyectos de clientes. La calidad del código es excelente y el soporte muy rápido.",
          userId: users[0]!.id,
          verified: true,
        },
        {
          rating: 5,
          title: "Mejor compra del año",
          body: "Increíble cantidad de demos y opciones de personalización. Lo recomiendo 100%.",
          userId: users[1]!.id,
          verified: true,
        },
        {
          rating: 4,
          title: "Muy bueno, alguna curva de aprendizaje",
          body: "Tarda un poco en dominar todas las opciones, pero el resultado final merece la pena.",
          userId: users[2]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "NexusCommerce - WooCommerce Theme",
      description: `NexusCommerce es un theme WooCommerce premium diseñado para crear tiendas online profesionales y de alta conversión.

Incluye todo lo necesario para empezar a vender online: filtros AJAX, búsqueda inteligente, wishlist, quick view, y mucho más.`,
      shortDescription: "Theme WooCommerce premium con todo lo necesario para vender online.",
      type: ProductType.THEME,
      categorySlug: "wordpress-themes",
      brandSlug: "wpforge",
      price: 89,
      salePrice: 69,
      features: [
        "Filtros AJAX avanzados",
        "Búsqueda inteligente",
        "Wishlist integrado",
        "Quick view",
        "Multi-vendor compatible",
        "Optimizado para conversión",
      ],
      compatibility: ["WordPress 6.0+", "WooCommerce 8.0+", "PHP 8.0+"],
      featured: true,
      rating: 4.8,
      reviewCount: 186,
      salesCount: 2100,
      versions: [
        {
          version: "3.1.0",
          changelog: "## 3.1.0\n- Soporte WooCommerce 9.0\n- Mejoras de velocidad",
          releasedAt: new Date("2024-11-20"),
        },
        {
          version: "3.0.0",
          changelog: "## 3.0.0\n- Rediseño completo\n- Nuevas funcionalidades",
          releasedAt: new Date("2024-08-10"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Perfecto para e-commerce",
          body: "Incrementamos nuestras ventas un 30% con este theme.",
          userId: users[3]!.id,
          verified: true,
        },
        {
          rating: 5,
          title: "El mejor para WooCommerce",
          body: "He probado muchos y este es sin duda el mejor.",
          userId: users[4]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "FormForge Pro - Advanced Form Builder",
      description: `FormForge Pro es el plugin de formularios más completo para WordPress. Crea formularios complejos con lógica condicional, cálculos, pagos integrados y mucho más.`,
      shortDescription: "Constructor de formularios avanzado con lógica condicional y pagos.",
      type: ProductType.PLUGIN,
      categorySlug: "wordpress-plugins",
      brandSlug: "codeforge",
      price: 49,
      features: [
        "Drag & drop builder",
        "Lógica condicional",
        "Cálculos automáticos",
        "Pagos integrados (Stripe, PayPal)",
        "50+ campos personalizados",
        "Integración con CRMs",
        "Anti-spam avanzado",
      ],
      compatibility: ["WordPress 5.8+", "PHP 7.4+"],
      trending: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 412,
      salesCount: 5230,
      versions: [
        {
          version: "4.2.0",
          changelog: "## 4.2.0\n- Nuevo campo firma\n- Integración con HubSpot",
          releasedAt: new Date("2024-12-01"),
        },
        {
          version: "4.1.0",
          changelog: "## 4.1.0\n- Mejoras de UX\n- Fix menores",
          releasedAt: new Date("2024-10-15"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "El mejor plugin de formularios",
          body: "Después de probar Gravity Forms y WPForms, me quedo con FormForge.",
          userId: users[0]!.id,
          verified: true,
        },
        {
          rating: 5,
          title: "Imprescindible",
          body: "Lo uso en todos mis proyectos.",
          userId: users[1]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "SEO Master Suite",
      description: `Plugin SEO todo-en-uno con análisis en tiempo real, schema markup, sitemaps y optimización de velocidad.`,
      shortDescription: "Suite SEO completa con análisis en tiempo real y schema markup.",
      type: ProductType.PLUGIN,
      categorySlug: "wordpress-plugins",
      brandSlug: "softcraft",
      price: 69,
      salePrice: 49,
      features: [
        "Análisis SEO en tiempo real",
        "Schema markup automático",
        "Sitemaps XML/HTML",
        "Integración con Google Search Console",
        "Optimización de imágenes",
        "Redirecciones 301",
        "Breadcrumbs",
      ],
      compatibility: ["WordPress 5.5+", "PHP 7.4+"],
      featured: true,
      rating: 4.7,
      reviewCount: 298,
      salesCount: 4150,
      versions: [
        {
          version: "5.0.0",
          changelog: "## 5.0.0\n- Rediseño completo del dashboard\n- IA para sugerencias",
          releasedAt: new Date("2024-11-10"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Reemplaza a Yoast y RankMath",
          body: "Mucho más completo y con mejor soporte.",
          userId: users[2]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "Minimal UI Kit",
      description: `UI Kit minimalista y moderno con más de 500 componentes, perfecto para diseñar aplicaciones SaaS, dashboards y sitios web.`,
      shortDescription: "UI Kit minimalista con 500+ componentes para Figma.",
      type: ProductType.TEMPLATE,
      categorySlug: "ui-templates",
      brandSlug: "pixellab",
      price: 39,
      features: [
        "500+ componentes",
        "Sistema de design tokens",
        "Dark + Light mode",
        "Auto-layout",
        "Variantes de componentes",
      ],
      compatibility: ["Figma 2024+", "Sketch 90+"],
      isNew: true,
      rating: 4.9,
      reviewCount: 156,
      salesCount: 1890,
      versions: [
        {
          version: "1.2.0",
          changelog: "## 1.2.0\n- 100 nuevos componentes\n- Mejoras en dark mode",
          releasedAt: new Date("2024-12-10"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Diseño impecable",
          body: "La atención al detalle es increíble.",
          userId: users[3]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "CloudStack - SaaS Starter Kit",
      description: `CloudStack es un starter kit completo para construir tu próximo SaaS. Incluye autenticación, suscripciones, dashboard de admin y mucho más.`,
      shortDescription: "Starter kit SaaS completo con auth, suscripciones y dashboard.",
      type: ProductType.SAAS,
      categorySlug: "saas-apps",
      brandSlug: "appstudio",
      price: 199,
      salePrice: 149,
      features: [
        "Next.js 15 + TypeScript",
        "Stripe subscriptions",
        "Multi-tenant architecture",
        "Admin dashboard",
        "API REST",
        "Webhooks",
        "Documentación completa",
      ],
      compatibility: ["Node.js 20+", "PostgreSQL 15+", "Redis 7+"],
      featured: true,
      trending: true,
      isNew: true,
      rating: 4.8,
      reviewCount: 89,
      salesCount: 520,
      versions: [
        {
          version: "1.5.0",
          changelog: "## 1.5.0\n- Soporte multi-idioma\n- Mejoras de UX",
          releasedAt: new Date("2024-12-20"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Ahorré meses de desarrollo",
          body: "La calidad del código es excepcional.",
          userId: users[4]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "InvoicePro - Sistema de Facturación",
      description: `Script PHP completo para gestionar facturación, clientes, productos e informes.`,
      shortDescription: "Sistema de facturación PHP con clientes, productos e informes.",
      type: ProductType.SCRIPT,
      categorySlug: "php-scripts",
      brandSlug: "codeforge",
      price: 59,
      features: [
        "Gestión de clientes",
        "Facturación recurrente",
        "Múltiples impuestos",
        "Exportación PDF",
        "Informes avanzados",
        "API REST",
      ],
      compatibility: ["PHP 8.0+", "MySQL 5.7+"],
      rating: 4.6,
      reviewCount: 134,
      salesCount: 980,
      versions: [
        {
          version: "2.0.0",
          changelog: "## 2.0.0\n- Rediseño completo",
          releasedAt: new Date("2024-09-15"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Excelente para mi negocio",
          body: "Lo uso a diario y funciona perfecto.",
          userId: users[0]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "Luxe Icons Pack",
      description: `Pack de 5000+ iconos premium en múltiples estilos: línea, relleno, duotono y más.`,
      shortDescription: "5000+ iconos premium en múltiples estilos.",
      type: ProductType.ICON_PACK,
      categorySlug: "icons-graphics",
      brandSlug: "brandify",
      price: 29,
      features: [
        "5000+ iconos únicos",
        "4 estilos (line, fill, duotone, hand-drawn)",
        "SVG, PNG, PDF",
        "Figma plugin",
        "Actualizaciones gratuitas",
      ],
      compatibility: ["SVG", "PNG", "Figma", "Sketch"],
      rating: 4.9,
      reviewCount: 312,
      salesCount: 4500,
      versions: [
        {
          version: "3.2.0",
          changelog: "## 3.2.0\n- 500 nuevos iconos",
          releasedAt: new Date("2024-12-01"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Calidad insuperable",
          body: "Los mejores iconos que he usado.",
          userId: users[1]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "MobileApp Starter - React Native",
      description: `Starter kit completo para crear aplicaciones móviles con React Native y Expo.`,
      shortDescription: "Starter React Native con auth, navegación y componentes UI.",
      type: ProductType.MOBILE_APP,
      categorySlug: "mobile-apps",
      brandSlug: "appstudio",
      price: 99,
      features: [
        "React Native + Expo",
        "Autenticación biométrica",
        "Navegación avanzada",
        "50+ componentes UI",
        "Notificaciones push",
        "Offline-first",
      ],
      compatibility: ["React Native 0.74+", "Expo 51+", "iOS 14+", "Android 10+"],
      isNew: true,
      rating: 4.7,
      reviewCount: 67,
      salesCount: 410,
      versions: [
        {
          version: "1.1.0",
          changelog: "## 1.1.0\n- Soporte Expo 51",
          releasedAt: new Date("2024-12-05"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Excelente punto de partida",
          body: "Me ahorró semanas de trabajo.",
          userId: users[2]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "Newsletter Pro Templates",
      description: `30 plantillas de email HTML responsive para Mailchimp, SendGrid y más.`,
      shortDescription: "30 plantillas email HTML responsive para todas las plataformas.",
      type: ProductType.EMAIL_TEMPLATE,
      categorySlug: "email-templates",
      brandSlug: "designhouse",
      price: 25,
      features: [
        "30 plantillas únicas",
        "100% responsive",
        "Compatible con todos los clientes",
        "Drag & drop friendly",
        "Dark mode",
      ],
      compatibility: ["Mailchimp", "SendGrid", "Mailgun", "Amazon SES"],
      rating: 4.8,
      reviewCount: 95,
      salesCount: 1240,
      versions: [
        {
          version: "2.0.0",
          changelog: "## 2.0.0\n- 10 nuevas plantillas",
          releasedAt: new Date("2024-11-25"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Las mejores plantillas",
          body: "Muy fáciles de personalizar.",
          userId: users[3]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "Convertly - Landing Page Pack",
      description: `Pack de 20 landing pages de alta conversión para diferentes nichos.`,
      shortDescription: "20 landing pages de alta conversión para múltiples nichos.",
      type: ProductType.LANDING_PAGE,
      categorySlug: "landing-pages",
      brandSlug: "pixellab",
      price: 45,
      features: [
        "20 diseños únicos",
        "Optimizadas para conversión",
        "A/B testing ready",
        "Analytics integrado",
        "Mobile-first",
      ],
      compatibility: ["HTML5", "CSS3", "JavaScript"],
      trending: true,
      rating: 4.7,
      reviewCount: 78,
      salesCount: 670,
      versions: [
        {
          version: "1.0.0",
          changelog: "## 1.0.0\n- Lanzamiento inicial",
          releasedAt: new Date("2024-10-01"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Excelente diseño",
          body: "Las conversiones subieron 40%.",
          userId: users[4]!.id,
          verified: true,
        },
      ],
    },
    {
      title: "3D Universe - Asset Pack",
      description: `500+ modelos 3D de alta calidad para renders, juegos y arquitectura.`,
      shortDescription: "500+ modelos 3D de alta calidad en múltiples formatos.",
      type: ProductType.GRAPHICS,
      categorySlug: "3d-assets",
      brandSlug: "designhouse",
      price: 149,
      salePrice: 99,
      features: [
        "500+ modelos 3D",
        "4K texturas",
        "Múltiples formatos (FBX, OBJ, GLB)",
        "PBR materials",
        "Licencia comercial",
      ],
      compatibility: ["Blender 4.0+", "3ds Max 2021+", "Cinema 4D R23+"],
      rating: 4.9,
      reviewCount: 42,
      salesCount: 280,
      versions: [
        {
          version: "1.5.0",
          changelog: "## 1.5.0\n- 100 nuevos modelos",
          releasedAt: new Date("2024-12-15"),
        },
      ],
      reviews: [
        {
          rating: 5,
          title: "Calidad profesional",
          body: "Perfectos para mis proyectos.",
          userId: users[0]!.id,
          verified: true,
        },
      ],
    },
  ];

  for (const productData of products) {
    const category = categories.find((c) => c.slug === productData.categorySlug);
    const brand = brands.find((b) => b.slug === productData.brandSlug);
    if (!category || !brand) continue;

    const product = await prisma.product.create({
      data: {
        slug: slugify(productData.title, { lower: true, strict: true }),
        title: productData.title,
        subtitle: productData.shortDescription,
        description: productData.description,
        shortDescription: productData.shortDescription,
        type: productData.type,
        status: ProductStatus.PUBLISHED,
        featured: productData.featured ?? false,
        trending: productData.trending ?? false,
        isNew: productData.isNew ?? false,
        price: productData.price,
        salePrice: productData.salePrice,
        currency: "USD",
        coverImage: `https://picsum.photos/seed/${slugify(productData.title, { lower: true })}/800/600`,
        gallery: Array.from({ length: 5 }, (_, i) =>
          `https://picsum.photos/seed/${slugify(productData.title, { lower: true })}-${i}/1200/800`,
        ),
        features: productData.features,
        compatibility: productData.compatibility,
        categoryId: category.id,
        brandId: brand.id,
        authorName: brand.name,
        metaTitle: `${productData.title} | MarketFlow`,
        metaDescription: productData.shortDescription,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        salesCount: productData.salesCount,
        fileSize: Math.floor(Math.random() * 50000000) + 5000000,
        fileType: "zip",
        publishedAt: new Date(),
      },
    });

    // Versions
    for (const v of productData.versions) {
      await prisma.productVersion.create({
        data: {
          productId: product.id,
          version: v.version,
          changelog: v.changelog,
          fileKey: `products/${product.slug}/${v.version}.zip`,
          fileName: `${product.slug}-${v.version}.zip`,
          fileSize: Math.floor(Math.random() * 50000000) + 5000000,
          compatibility: productData.compatibility,
          isLatest: v === productData.versions[0],
          releasedAt: v.releasedAt,
        },
      });
    }

    // Reviews
    for (const r of productData.reviews) {
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: r.userId,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
          status: "APPROVED",
        },
      });
    }
  }

  // =========================
  // COUPONS
  // =========================
  console.log("🎟️ Creating coupons...");

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% de descuento en tu primera compra",
        type: "PERCENTAGE",
        value: 10,
        maxUses: 1000,
        maxUsesPerUser: 1,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: "SAVE20",
        description: "20% de descuento en productos seleccionados",
        type: "PERCENTAGE",
        value: 20,
        maxUses: 500,
        maxUsesPerUser: 1,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: "FLAT5",
        description: "$5 de descuento fijo",
        type: "FIXED",
        value: 5,
        minOrderAmount: 25,
        maxUses: null,
        maxUsesPerUser: 3,
        isActive: true,
      },
    ],
  });

  // =========================
  // SETTINGS
  // =========================
  console.log("⚙️ Creating settings...");

  await prisma.setting.createMany({
    data: [
      {
        key: "site.name",
        value: "MarketFlow",
        type: "string",
        group: "general",
        isPublic: true,
      },
      {
        key: "site.description",
        value:
          "Marketplace premium de productos digitales: themes, plugins, scripts, templates y más.",
        type: "string",
        group: "general",
        isPublic: true,
      },
      {
        key: "site.url",
        value: "https://marketflow.dev",
        type: "string",
        group: "general",
        isPublic: true,
      },
      {
        key: "site.locale",
        value: "es",
        type: "string",
        group: "general",
        isPublic: true,
      },
      {
        key: "site.currency",
        value: "USD",
        type: "string",
        group: "general",
        isPublic: true,
      },
      {
        key: "checkout.tax_rate",
        value: 0,
        type: "number",
        group: "checkout",
        isPublic: true,
      },
      {
        key: "checkout.currency",
        value: "USD",
        type: "string",
        group: "checkout",
        isPublic: true,
      },
      {
        key: "download.expiry_hours",
        value: 24,
        type: "number",
        group: "downloads",
        isPublic: false,
      },
      {
        key: "download.max_per_license",
        value: 10,
        type: "number",
        group: "downloads",
        isPublic: false,
      },
      {
        key: "maintenance.enabled",
        value: false,
        type: "boolean",
        group: "general",
        isPublic: true,
      },
    ],
  });

  // =========================
  // PAYMENT PROVIDERS
  // =========================
  console.log("💳 Creating payment providers...");

  await prisma.paymentProvider.createMany({
    data: [
      { name: "stripe", displayName: "Stripe", isActive: true, isTestMode: true, order: 1 },
      { name: "paypal", displayName: "PayPal", isActive: true, isTestMode: true, order: 2 },
      { name: "mercadopago", displayName: "MercadoPago", isActive: true, isTestMode: true, order: 3 },
      { name: "binance", displayName: "Binance Pay", isActive: true, isTestMode: true, order: 4 },
      { name: "crypto", displayName: "Crypto", isActive: true, isTestMode: true, order: 5 },
      { name: "bank_transfer", displayName: "Transferencia", isActive: true, isTestMode: true, order: 6 },
    ],
  });

  // =========================
  // BLOG CATEGORIES
  // =========================
  console.log("📝 Creating blog categories...");

  const blogCategories = await Promise.all(
    [
      { name: "Tutoriales", slug: "tutoriales", color: "#7C3AED" },
      { name: "Novedades", slug: "novedades", color: "#10B981" },
      { name: "Guías", slug: "guias", color: "#3B82F6" },
      { name: "Recursos", slug: "recursos", color: "#F59E0B" },
    ].map((c) => prisma.blogCategory.create({ data: c })),
  );

  // =========================
  // BLOG POSTS
  // =========================
  console.log("📰 Creating blog posts...");

  const blogPosts = [
    {
      slug: "como-elegir-el-mejor-wordpress-theme",
      title: "Cómo elegir el mejor WordPress Theme para tu proyecto",
      excerpt:
        "Guía completa para seleccionar el theme perfecto según tus necesidades, presupuesto y objetivos.",
      content: `# Cómo elegir el mejor WordPress Theme

Elegir el theme correcto es una de las decisiones más importantes...`,
      contentHtml: "<h1>Cómo elegir el mejor WordPress Theme</h1><p>Elegir el theme correcto...</p>",
      categoryId: blogCategories[2]!.id,
      readTime: 8,
    },
    {
      slug: "tendencias-diseno-web-2025",
      title: "10 tendencias de diseño web para 2025",
      excerpt: "Las tendencias que dominarán el diseño web el próximo año.",
      content: `# 10 tendencias de diseño web para 2025

El diseño web evoluciona constantemente...`,
      contentHtml: "<h1>10 tendencias de diseño web para 2025</h1>",
      categoryId: blogCategories[1]!.id,
      readTime: 6,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        ...post,
        authorId: admin.id,
        status: "PUBLISHED",
        coverImage: `https://picsum.photos/seed/${post.slug}/1200/630`,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        publishedAt: new Date(),
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.category.count()} categories`);
  console.log(`   - ${await prisma.brand.count()} brands`);
  console.log(`   - ${await prisma.product.count()} products`);
  console.log(`   - ${await prisma.productVersion.count()} product versions`);
  console.log(`   - ${await prisma.review.count()} reviews`);
  console.log(`   - ${await prisma.coupon.count()} coupons`);
  console.log(`   - ${await prisma.blogPost.count()} blog posts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
