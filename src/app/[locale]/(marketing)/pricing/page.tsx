import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/shared/section";
import Link from "next/link";

const plans = [
  {
    name: "Gratis",
    price: 0,
    desc: "Para explorar el marketplace",
    features: ["Crear cuenta", "Explorar productos", "Lista de deseos", "Newsletter"],
    cta: "Crear cuenta",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: 19,
    desc: "Para profesionales y freelancers",
    features: [
      "Todo lo de Gratis",
      "Descarga ilimitada",
      "Licencias comerciales",
      "Actualizaciones premium",
      "Soporte prioritario",
      "Sin marca de agua",
    ],
    cta: "Empezar ahora",
    href: "/products",
    featured: true,
  },
  {
    name: "Equipo",
    price: 99,
    desc: "Para agencias y equipos",
    features: [
      "Todo lo de Pro",
      "Licencias ilimitadas",
      "Múltiples usuarios",
      "API access",
      "Soporte dedicado",
      "Onboarding personalizado",
    ],
    cta: "Contactar",
    href: "#",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <Section containerSize="wide">
      <SectionHeader
        title="Planes y precios"
        subtitle="Elige el plan perfecto para ti"
        align="center"
        badge={<><Sparkles className="size-3.5" /> Pricing</>}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={
              p.featured
                ? "relative border-brand-500/40 shadow-xl shadow-brand-500/10"
                : ""
            }
          >
            {p.featured && (
              <Badge
                variant="brand"
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                Más popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.desc}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={p.featured ? "brand" : "outline"}
                className="mt-6 w-full"
                asChild
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
