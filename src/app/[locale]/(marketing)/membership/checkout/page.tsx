import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, ShieldCheck } from "lucide-react";
import { MembershipCheckoutForm } from "./membership-checkout-form";
import { Link as I18nLink } from "@/i18n/routing";

export const metadata = {
  title: "Checkout de Membresía",
};

export default async function MembershipCheckoutPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ planId: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/membership");
  }

  const { planId } = await searchParams;
  
  if (!planId) {
    redirect("/membership");
  }

  const plan = await db.membershipPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || !plan.isActive) {
    redirect("/membership");
  }

  // Check if they already have an active membership
  const existing = await db.userMembership.findUnique({
    where: { userId: session.user.id }
  });

  const settingsList = await db.setting.findMany({
    where: {
      key: {
        in: [
          "payment_paypal_active",
          "payment_mp_active",
          "payment_coinpal_active",
          "payment_manual_active",
        ],
      },
    },
  });

  const activeMethods = {
    paypal: false,
    mercadopago: false,
    coinpal: false,
    manual: false,
  };

  settingsList.forEach((s) => {
    if (s.key === "payment_paypal_active" && s.value === "true") activeMethods.paypal = true;
    if (s.key === "payment_mp_active" && s.value === "true") activeMethods.mercadopago = true;
    if (s.key === "payment_coinpal_active" && s.value === "true") activeMethods.coinpal = true;
    if (s.key === "payment_manual_active" && s.value === "true") activeMethods.manual = true;
  });

  return (
    <div className="container-fluid py-12 md:py-24">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Detalles del Plan */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Resumen de Membresía</h1>
          <p className="text-muted-foreground mb-8">Estás a un paso de obtener acceso ilimitado.</p>
          
          <Card className="border-brand-500/50 shadow-md">
            <CardHeader className="bg-brand-500/5 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5 text-brand-500" /> {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-end border-b pb-4">
                <span className="font-medium text-lg">Total a pagar:</span>
                <span className="text-3xl font-bold tracking-tight">${Number(plan.price)}</span>
              </div>
              
              <ul className="space-y-3 pt-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="size-5 text-brand-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-3 mt-6 text-sm text-muted-foreground bg-accent/50 p-4 rounded-lg">
            <ShieldCheck className="size-8 text-green-500 shrink-0" />
            <p>Tu pago se procesará de forma segura. Puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario.</p>
          </div>
        </div>

        {/* Formulario de Pago */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>
                Selecciona cómo deseas pagar tu membresía.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {existing && existing.status === "ACTIVE" ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center size-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <Check className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ya tienes una membresía activa</h3>
                  <p className="text-muted-foreground mb-6">Tu membresía actual cubre este acceso.</p>
                  <Button variant="brand" className="mt-6" asChild>
                    <I18nLink href="/dashboard">Ir al Panel de Control</I18nLink>
                  </Button>
                </div>
              ) : (
                <MembershipCheckoutForm planId={plan.id} price={Number(plan.price)} activeMethods={activeMethods} />
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
