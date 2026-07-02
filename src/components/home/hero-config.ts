export interface HeroTrustBadge {
  icon: string;
  text: string;
}

export interface HeroStat {
  value: string;
  label: string;
  icon: string;
}

export interface HeroConfig {
  enabled: boolean;
  badge: {
    enabled: boolean;
    text: string;
  };
  title: {
    text: string;
    highlightLastWords: number;
  };
  subtitle: string;
  search: {
    enabled: boolean;
    hint: string;
  };
  trustBadges: HeroTrustBadge[];
  stats: HeroStat[];
  image: {
    enabled: boolean;
    src: string;
    alt: string;
  };
}

export const defaultHeroConfig: { es: HeroConfig; en: HeroConfig } = {
  es: {
    enabled: true,
    badge: {
      enabled: true,
      text: "Marketplace #1 en productos digitales",
    },
    title: {
      text: "El marketplace premium para creadores",
      highlightLastWords: 2,
    },
    subtitle:
      "Descubre miles de themes, plugins, templates y scripts creados por los mejores estudios del mundo. Calidad profesional, soporte premium y actualizaciones de por vida.",
    search: {
      enabled: true,
      hint: "Prueba buscar: \"theme para portfolio\", \"plugin para reservas\", \"SaaS starter\"",
    },
    trustBadges: [
      { icon: "Shield", text: "Pagos 100% seguros" },
      { icon: "Zap", text: "Descarga instantánea" },
      { icon: "Download", text: "Soporte premium" },
      { icon: "Sparkles", text: "Actualizaciones gratis" },
    ],
    stats: [
      { value: "12,500+", label: "Productos", icon: "Package" },
      { value: "850+", label: "Creadores", icon: "Users" },
      { value: "1.2M+", label: "Descargas", icon: "Download" },
      { value: "99%", label: "Satisfacción", icon: "Star" },
    ],
    image: {
      enabled: true,
      src: "/uploads/slider.png",
      alt: "Hero Professional",
    },
  },
  en: {
    enabled: true,
    badge: {
      enabled: true,
      text: "#1 Marketplace for digital products",
    },
    title: {
      text: "The premium marketplace for creators",
      highlightLastWords: 2,
    },
    subtitle:
      "Discover thousands of themes, plugins, templates and scripts created by the world's best studios. Professional quality, premium support and lifetime updates.",
    search: {
      enabled: true,
      hint: "Try searching: \"portfolio theme\", \"booking plugin\", \"SaaS starter\"",
    },
    trustBadges: [
      { icon: "Shield", text: "100% secure payments" },
      { icon: "Zap", text: "Instant download" },
      { icon: "Download", text: "Premium support" },
      { icon: "Sparkles", text: "Free updates" },
    ],
    stats: [
      { value: "12,500+", label: "Products", icon: "Package" },
      { value: "850+", label: "Creators", icon: "Users" },
      { value: "1.2M+", label: "Downloads", icon: "Download" },
      { value: "99%", label: "Satisfaction", icon: "Star" },
    ],
    image: {
      enabled: true,
      src: "/uploads/slider.png",
      alt: "Hero Professional",
    },
  },
};

export function mergeHeroConfig(
  locale: string,
  saved?: HeroConfig | null | Record<string, unknown>
): HeroConfig {
  const base: HeroConfig =
    locale === "en" ? defaultHeroConfig.en : defaultHeroConfig.es;
  if (!saved || typeof saved !== "object") return base;

  return {
    enabled: (saved.enabled as boolean) ?? base.enabled,
    badge: {
      enabled: (saved.badge as HeroConfig["badge"])?.enabled ?? base.badge.enabled,
      text: (saved.badge as HeroConfig["badge"])?.text ?? base.badge.text,
    },
    title: {
      text: (saved.title as HeroConfig["title"])?.text ?? base.title.text,
      highlightLastWords:
        (saved.title as HeroConfig["title"])?.highlightLastWords ?? base.title.highlightLastWords,
    },
    subtitle: (saved.subtitle as string) ?? base.subtitle,
    search: {
      enabled: (saved.search as HeroConfig["search"])?.enabled ?? base.search.enabled,
      hint: (saved.search as HeroConfig["search"])?.hint ?? base.search.hint,
    },
    trustBadges: Array.isArray(saved.trustBadges)
      ? (saved.trustBadges as HeroTrustBadge[])
      : base.trustBadges,
    stats: Array.isArray(saved.stats)
      ? (saved.stats as HeroStat[]).map((s, i) => ({
          ...s,
          icon: s.icon || base.stats[i]?.icon || "Star",
        }))
      : base.stats,
    image: {
      enabled: (saved.image as HeroConfig["image"])?.enabled ?? base.image.enabled,
      src: (saved.image as HeroConfig["image"])?.src ?? base.image.src,
      alt: (saved.image as HeroConfig["image"])?.alt ?? base.image.alt,
    },
  };
}
