import * as React from "react";
import { db } from "@/lib/db";
import { Section, SectionHeader } from "@/components/shared/section";
import { formatDate, formatRelativeDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { History, Sparkles, Box, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata() {
  return {
    title: "Últimas actualizaciones",
    description: "Descubre las últimas versiones y mejoras de los productos en MarketFlow.",
  };
}

export default async function ChangelogPage() {
  // Fetch latest 50 product versions across the entire platform
  const versions = await db.productVersion.findMany({
    orderBy: { releasedAt: "desc" },
    take: 50,
    include: {
      product: {
        select: {
          title: true,
          slug: true,
          coverImage: true,
          category: { select: { name: true } }
        }
      }
    }
  });

  return (
    <div className="container-fluid py-8 md:py-12 lg:py-16">
      <SectionHeader 
        title="Últimas actualizaciones" 
        subtitle="Descubre las últimas mejoras, correcciones y nuevas funcionalidades de tus productos favoritos." 
        align="center"
      />

      <Section className="mx-auto max-w-4xl">
        <div className="relative border-l border-border/40 pl-6 md:pl-8">
          {versions.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No hay actualizaciones recientes para mostrar.
            </div>
          ) : (
            <div className="space-y-12">
              {versions.map((v) => (
                <div key={v.id} className="relative">
                  {/* Timeline node */}
                  <div className="absolute -left-[31px] md:-left-[39px] top-1 flex size-5 items-center justify-center rounded-full border border-brand-500/30 bg-background md:size-6">
                    <div className="size-2 rounded-full bg-brand-500 md:size-2.5" />
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    {/* Product Image */}
                    <Link
                      href={`/product/${v.product.slug}`}
                      className="group relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted sm:w-48"
                    >
                      <Image 
                        src={v.product.coverImage} 
                        alt={v.product.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                          <time className="font-medium text-foreground/80">
                            {formatDate(v.releasedAt)}
                          </time>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{formatRelativeDate(v.releasedAt)}</span>
                        </div>
                        
                        <Link href={`/product/${v.product.slug}`} className="group/title inline-flex items-center gap-2 hover:text-brand-600 transition-colors">
                          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
                            {v.product.title}
                          </h2>
                          <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover/title:translate-x-0 group-hover/title:opacity-100" />
                        </Link>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Box className="size-3" />
                            {v.product.category.name}
                          </Badge>
                          <Badge variant="outline" className="font-mono gap-1">
                            <History className="size-3" />
                            v{v.version}
                          </Badge>
                          {v.isLatest && (
                            <Badge variant="brand" className="gap-1 shadow-sm">
                              <Sparkles className="size-3" />
                              Latest
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="prose-content rounded-xl border border-border/40 bg-card p-4 text-sm text-foreground/90 shadow-sm">
                        {v.changelog.split("\n").map((line, j) => {
                          if (line.startsWith("## "))
                            return <h4 key={j} className="mt-2 mb-1 font-semibold">{line.replace("## ", "")}</h4>;
                          if (line.startsWith("### "))
                            return <h5 key={j} className="mt-1 mb-1 font-medium">{line.replace("### ", "")}</h5>;
                          if (line.startsWith("- "))
                            return <li key={j} className="ml-4 list-disc">{line.replace("- ", "")}</li>;
                          if (line.trim()) return <p key={j} className="mb-1">{line}</p>;
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
