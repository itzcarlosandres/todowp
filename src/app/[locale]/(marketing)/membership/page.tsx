import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: `Membresías | ${t("siteName")}`,
    description: "Accede a todos nuestros productos con una única suscripción.",
  };
}

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch active plans from DB
  const plans = await db.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" }
  });

  const getPlanImage = (interval: string) => {
    switch (interval) {
      case "month": return "/membresia/mensual.avif";
      case "year": return "/membresia/anual.avif";
      case "lifetime": return "/membresia/vida.avif";
      default: return "/membresia/mensual.avif";
    }
  };

  return (
    <div className="container-fluid py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center pb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Acceso ilimitado a <span className="text-brand-500">todo</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descarga cualquier producto de nuestras categorías autorizadas sin límites. 
          Cancela en cualquier momento. Un solo pago para acceder a calidad premium.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 pt-6">
        {plans.map((plan) => {
          const isMonth = plan.interval === 'month';
          const isYear = plan.interval === 'year';
          const isLife = plan.interval === 'lifetime';

          const borderColor = isMonth ? 'border-rose-500/30' : isYear ? 'border-blue-500/30' : 'border-orange-500/50';
          const shadowClass = isLife ? 'shadow-xl shadow-orange-500/10 scale-[1.02] z-10' : 'shadow-sm';
          const iconBg = isMonth ? 'bg-rose-500/10' : isYear ? 'bg-blue-500/10' : 'bg-orange-500/10';
          const badgeBg = isMonth ? 'bg-rose-500' : isYear ? 'bg-[#00a8e8]' : 'bg-[#ff8a00]';
          const checkColor = isMonth ? 'text-rose-500' : isYear ? 'text-[#00a8e8]' : 'text-[#ff8a00]';
          const btnClass = isMonth ? 'bg-[#00d060] hover:bg-[#00d060]/90 text-white' : isYear ? 'bg-[#00a8e8] hover:bg-[#00a8e8]/90 text-white' : 'bg-[#ff8a00] hover:bg-[#ff8a00]/90 text-white';
          
          const fakeOldPrice = isMonth ? 49 : isYear ? 240 : 480;
          const fakeDiscount = isMonth ? '69%' : isYear ? '80%' : '89%';
          const fakeGift = isMonth ? '1 Licencia gratuita de Elementor Pro' : isYear ? '3 Licencias gratuitas de Elementor Pro' : '5 Licencias gratuitas de Elementor Pro';

          return (
            <Card key={plan.id} className={`flex flex-col relative transition-all ${borderColor} ${shadowClass}`}>
              {isLife && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <span className="bg-[#ff8a00] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                    Más populares
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-10">
                <div className="flex justify-center mb-4">
                  <div className={`size-20 rounded-2xl flex items-center justify-center ${iconBg}`}>
                    <Image 
                      src={getPlanImage(plan.interval)}
                      alt={plan.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-muted-foreground line-through text-sm">${fakeOldPrice}.00</span>
                  <span className={`${badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    {fakeDiscount} DE DESCUENTO
                  </span>
                </div>
                
                <div className="flex items-baseline justify-center gap-x-1">
                  <span className="text-5xl font-black tracking-tight">${Number(plan.price).toFixed(2)}</span>
                  {plan.interval !== 'lifetime' && (
                    <span className="text-muted-foreground text-sm font-medium">/ 1 {plan.interval === 'month' ? 'mes' : 'año'}</span>
                  )}
                </div>
                {isLife && (
                  <p className="text-xs text-[#ff8a00] font-medium mt-2">Pago único, acceso de por vida</p>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 px-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/80 font-medium items-start">
                      <Check className={`size-4 shrink-0 mt-0.5 ${checkColor}`} />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-muted/30 border border-border rounded-lg p-3 text-center mb-2 flex items-center justify-center gap-2">
                  <Crown className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">{fakeGift}</span>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6">
                <Button 
                  asChild 
                  className={`w-full rounded-xl h-12 text-sm font-bold shadow-md transition-all ${btnClass}`}
                >
                  <Link href={`/membership/checkout?planId=${plan.id}`}>
                    {isMonth ? (
                      <>
                        <Check className="mr-2 size-4" /> Ir al carrito
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 size-4" /> Obtén Premium
                      </>
                    )}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {plans.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No hay planes de membresía disponibles en este momento.
        </div>
      )}
    </div>
  );
}
