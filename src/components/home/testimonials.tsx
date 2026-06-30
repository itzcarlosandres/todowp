"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";

const testimonials = [
  {
    name: "María González",
    role: "Diseñadora freelance",
    avatar: "https://i.pravatar.cc/100?img=1",
    content:
      "MarketFlow ha transformado mi flujo de trabajo. La calidad de los themes y el soporte son incomparables.",
    rating: 5,
  },
  {
    name: "Carlos Ruiz",
    role: "CTO en TechStartup",
    avatar: "https://i.pravatar.cc/100?img=2",
    content:
      "Hemos ahorrado meses de desarrollo gracias a los SaaS starters. Una inversión que vale cada céntimo.",
    rating: 5,
  },
  {
    name: "Laura Martínez",
    role: "Desarrolladora web",
    avatar: "https://i.pravatar.cc/100?img=3",
    content:
      "El marketplace favorito de mi equipo. Actualizaciones constantes, soporte premium y precios justos.",
    rating: 5,
  },
  {
    name: "David Sánchez",
    role: "Agencia digital",
    avatar: "https://i.pravatar.cc/100?img=4",
    content:
      "Calidad profesional y una experiencia de compra impecable. Lo recomiendo a todos mis clientes.",
    rating: 5,
  },
];

export function Testimonials() {
  const t = {
    title: "Lo que dicen nuestros clientes",
    subtitle: "Miles de profesionales confían en nosotros",
  };

  return (
    <Section containerSize="wide" className="bg-muted/20">
      <SectionHeader title={t.title} subtitle={t.subtitle} align="center" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, idx) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 card-hover hover:border-brand-500/40"
          >
            <Quote className="size-8 text-brand-500/30 transition-colors group-hover:text-brand-500/50" />

            <p className="text-pretty text-sm leading-relaxed text-foreground/90">
              {t.content}
            </p>

            <div className="mt-auto flex items-center gap-3 border-t border-border/40 pt-4">
              <div className="relative size-10 overflow-hidden rounded-full border border-border/60">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-3 fill-warning stroke-warning" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
