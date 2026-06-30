import { ArrowRight, Sparkles } from "lucide-react";
import { Link as I18nLink } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";

export function CTASection() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-8 text-center text-white md:p-16">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -right-20 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Sparkles className="mx-auto size-10 text-white/80" />
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
            ¿Listo para empezar?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-white/80 md:text-lg">
            Únete a miles de profesionales que ya confían en MarketFlow para crear experiencias digitales increíbles.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="xl" className="bg-white text-brand-700 hover:bg-white/90">
              <I18nLink href="/products">
                Explorar marketplace
                <ArrowRight className="ml-2 size-4" />
              </I18nLink>
            </Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <I18nLink href="/register">Crear cuenta gratis</I18nLink>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
