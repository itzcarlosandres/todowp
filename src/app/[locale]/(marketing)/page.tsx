import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { FeaturedHorizontalSection } from "@/components/home/featured-horizontal-section";
import { ProductListSection } from "@/components/home/product-list-section";
import { CTASection } from "@/components/home/cta-section";
import { Section } from "@/components/shared/section";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { getHeroConfig } from "@/components/home/hero-actions";

export async function generateMetadata() {
  return buildMetadata({ type: "website" });
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  const heroConfig = await getHeroConfig(locale);

  return (
    <>
      <HeroSection config={heroConfig} locale={locale} />
      <BrandMarquee />

      <Section containerSize="wide" spacing="default">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <ProductListSection
              title="Productos destacados"
              subtitle="Lo mejor de nuestro marketplace, seleccionado para ti"
              filter="featured"
              seeAllHref="/products?featured=true"
              seeAllLabel="Ver todos"
              limit={5}
            />
            <ProductListSection
              title="Los más vendidos"
              subtitle="Los favoritos de nuestra comunidad"
              filter="trending"
              seeAllHref="/products?sort=sales"
              seeAllLabel="Ver ranking"
              limit={5}
            />
          </div>
        </div>
      </Section>

      <FeaturedHorizontalSection
        title="Recién llegados"
        subtitle="Lo último en productos digitales"
        filter="isNew"
        seeAllHref="/products?isNew=true"
        seeAllLabel="Ver más"
        limit={4}
      />

      <CategoryGrid />

      <CTASection />
    </>
  );
}
