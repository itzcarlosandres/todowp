import * as React from "react";
import Image from "next/image";
import { getBrands } from "@/modules/brands";
import { Section, SectionHeader } from "@/components/shared/section";

export async function BrandMarquee() {
  const t = await import("next-intl/server").then((m) => m.getTranslations("home.brands"));
  const brands = await getBrands();

  if (brands.length === 0) return null;

  return (
    <Section spacing="sm" containerSize="wide">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} align="center" />

      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-12 [--gap:3rem]">
          {[...brands, ...brands].map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="relative size-10 overflow-hidden rounded-md border border-border/60 bg-background p-1.5 grayscale transition-all duration-300 group-hover:grayscale-0">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs font-bold">
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
