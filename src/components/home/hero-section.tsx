"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HeroConfig } from "./hero-config";
import { defaultHeroConfig } from "./hero-config";

interface Suggestion {
  id: string;
  slug: string;
  title: string;
  price: number;
  salePrice: number | null;
  coverImage: string;
  category?: { name: string; slug: string; color: string | null } | null;
}

function formatIconName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const formatted = formatIconName(name);
  const IconComponent = ((Icons as unknown) as Record<string, React.ElementType>)[formatted];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

function splitTitle(title: string, highlightLastWords: number) {
  const words = title.split(" ");
  if (!highlightLastWords || highlightLastWords >= words.length) {
    return { normal: "", highlight: title };
  }
  const normal = words.slice(0, -highlightLastWords).join(" ");
  const highlight = words.slice(-highlightLastWords).join(" ");
  return { normal, highlight };
}

interface HeroSectionProps {
  config?: HeroConfig;
  locale?: string;
}

export function HeroSection({ config, locale = "es" }: HeroSectionProps) {
  const c = config ?? (locale === "en" ? defaultHeroConfig.en : defaultHeroConfig.es);
  const tCommon = useTranslations("common");

  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!c.enabled) return null;

  const titleParts = splitTitle(c.title.text, c.title.highlightLastWords);

  return (
    <section className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 bg-grid-animated opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-brand-500/10 via-brand-500/5 to-transparent" />

      <div className="container-fluid relative py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left z-10"
          >
            {c.badge.enabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium backdrop-blur-md"
              >
                <DynamicIcon name="Sparkles" className="size-3.5 text-brand-500" />
                <span className="text-pretty">{c.badge.text}</span>
              </motion.div>
            )}

            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl xl:text-6xl">
              {titleParts.normal && <span className="block">{titleParts.normal}</span>}
              {titleParts.highlight && (
                <span className="block gradient-text">{titleParts.highlight}</span>
              )}
            </h1>

            <p className="text-pretty mx-auto lg:mx-0 mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              {c.subtitle}
            </p>

            {/* Search */}
            {c.search.enabled && (
              <div ref={containerRef} className="relative mx-auto lg:mx-0 mt-8 max-w-xl">
                <form
                  action="/products"
                  className="relative"
                  onSubmit={(e) => {
                    if (!query) e.preventDefault();
                  }}
                >
                  <div className="glass-strong relative flex items-center rounded-2xl p-1.5 shadow-2xl shadow-brand-500/10">
                    <div className="flex flex-1 items-center gap-2 pl-4">
                      {loading ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Search className="size-4 text-muted-foreground" />
                      )}
                      <Input
                        ref={inputRef}
                        name="q"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setOpen(true)}
                        placeholder={tCommon("searchPlaceholder")}
                        className="h-12 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <Button type="submit" variant="brand" size="lg" className="rounded-xl">
                      {tCommon("search")}
                    </Button>
                  </div>
                </form>

                {/* Suggestions dropdown */}
                {open && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/60 bg-popover/95 shadow-2xl backdrop-blur-xl"
                  >
                    <ul className="max-h-96 overflow-y-auto p-2">
                      {suggestions.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/product/${s.slug}`}
                            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                            onClick={() => setOpen(false)}
                          >
                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                              <img
                                src={s.coverImage}
                                alt={s.title}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-medium">{s.title}</p>
                              <p className="text-xs text-muted-foreground">{s.category?.name}</p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              ${(s.salePrice ?? s.price).toFixed(2)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/60 p-2">
                      <Link
                        href={`/products?q=${encodeURIComponent(query)}`}
                        className="block rounded-md p-2 text-center text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        onClick={() => setOpen(false)}
                      >
                        Ver todos los resultados para &quot;{query}&quot;
                      </Link>
                    </div>
                  </motion.div>
                )}

                <p className="mt-3 text-xs text-muted-foreground text-center lg:text-left">
                  <span className="opacity-70">💡</span> {c.search.hint}
                </p>
              </div>
            )}

            {/* Trust badges */}
            {c.trustBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground"
              >
                {c.trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <DynamicIcon name={badge.icon} className="size-4" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Hero Image */}
          {c.image.enabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[550px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0"
            >
              {/* Soft decorative glow behind the image */}
              <div className="absolute inset-0 bg-brand-500/15 blur-3xl rounded-full scale-100 translate-x-4" />

              <img
                src={c.image.src}
                alt={c.image.alt}
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in origin-center"
              />
            </motion.div>
          )}
        </div>

        {/* Stats */}
        {c.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 relative z-10"
          >
            {c.stats.map((stat, i) => {
              const IconComponent = (stat.icon && (Icons as any)[stat.icon]) ? (Icons as any)[stat.icon] : null;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur-md shadow-sm"
                >
                  {IconComponent && <IconComponent className="size-5 text-brand-500 mx-auto mb-1.5" />}
                  <p className="text-2xl font-bold tabular-nums md:text-3xl text-center">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground text-center">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
