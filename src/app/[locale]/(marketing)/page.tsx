import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { FeaturedSection } from "@/components/home/featured-section";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { Newsletter } from "@/components/home/newsletter";
import { CTASection } from "@/components/home/cta-section";
import { getTranslations } from "next-intl/server";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { getHeroConfig } from "@/components/home/hero-actions";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return buildMetadata({
    title: t("siteName"),
    description: t("siteDescription"),
    type: "website",
  });
}

import { db } from "@/lib/db";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  const [settings, heroConfig] = await Promise.all([
    db.setting.findMany({
      where: {
        key: { in: ["store_home_products_cols", "store_home_products_limit"] },
      },
    }),
    getHeroConfig(locale),
  ]);

  const colsSetting = settings.find((s) => s.key === "store_home_products_cols")?.value;
  const limitSetting = settings.find((s) => s.key === "store_home_products_limit")?.value;

  const cols = colsSetting ? (parseInt(String(colsSetting), 10) as 2 | 3 | 4 | 5 | 6) : 5;
  const limit = limitSetting ? parseInt(String(limitSetting), 10) : 10;

  return (
    <>
      <HeroSection config={heroConfig} locale={locale} />
      <CategoryGrid />
      <BrandMarquee />
      <FeaturedSection
        title="Productos destacados"
        subtitle="Lo mejor de nuestro marketplace, seleccionado para ti"
        filter="featured"
        seeAllHref="/products?featured=true"
        seeAllLabel="Ver todos"
        cols={cols}
        limit={limit}
      />
      <FeaturedSection
        title="Recién llegados"
        subtitle="Lo último en productos digitales"
        filter="isNew"
        seeAllHref="/products?isNew=true"
        seeAllLabel="Ver más"
        cols={cols}
        limit={limit}
      />
      <FeaturedSection
        title="Los más vendidos"
        subtitle="Los favoritos de nuestra comunidad"
        filter="trending"
        seeAllHref="/products?sort=sales"
        seeAllLabel="Ver ranking completo"
        cols={cols}
        limit={limit}
      />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <CTASection />
    </>
  );
}
