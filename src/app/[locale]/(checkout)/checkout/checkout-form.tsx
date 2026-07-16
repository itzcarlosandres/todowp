"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Check, Shield, Lock, Building2, Bitcoin, Banknote, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link as I18nLink } from "@/i18n/routing";
import { getUserBalance } from "@/modules/cashback";
import { useSession } from "next-auth/react";

const billingSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

type BillingFormData = z.infer<typeof billingSchema>;

interface CheckoutFormProps {
  activeMethods: {
    paypal: boolean;
    mercadopago: boolean;
    coinpal: boolean;
    manual: boolean;
  };
}

export function CheckoutForm({ activeMethods }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((acc, i) => acc + (i.salePrice ?? i.price) * i.quantity, 0);

  const [walletBalance, setWalletBalance] = React.useState(0);
  const [useCashback, setUseCashback] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  React.useEffect(() => {
    if (session?.user?.id) {
      getUserBalance(session.user.id).then(setWalletBalance);
    }
  }, [session]);
  
  // Available methods based on settings
  const availableMethods = [];
  if (activeMethods.paypal) {
    availableMethods.push({ id: "paypal", name: "PayPal", icon: "🅿️", desc: "Paga con tu cuenta PayPal" });
  }
  if (activeMethods.mercadopago) {
    availableMethods.push({ id: "mercadopago", name: "MercadoPago", icon: "💙", desc: "Tarjeta, efectivo, transferencia" });
  }
  if (activeMethods.coinpal) {
    availableMethods.push({ id: "coinpal", name: "Criptomonedas", icon: <Bitcoin className="size-6" />, desc: "BTC, ETH, USDT y más" });
  }
  if (activeMethods.manual) {
    availableMethods.push({ id: "manual", name: "Transferencia bancaria", icon: <Building2 className="size-6" />, desc: "Pago manual" });
  }
  
  // Also keep stripe if we want it by default, or just fallback to the first active
  const initialMethod = availableMethods.length > 0 ? availableMethods[0]?.id ?? "" : "";
  const [method, setMethod] = React.useState<string>(initialMethod);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const onSubmit = async (data: BillingFormData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal, useCashback, billing: data }),
      });
      const result = await res.json();

      if (result.url) {
        window.location.href = result.url;
      } else if (result.success) {
        setSuccess(true);
      } else {
        console.error("Error al procesar pago:", result.error);
        alert("Ocurrió un error al procesar el pago.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container-fluid py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="size-8" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("success.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("success.subtitle")}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="brand" asChild>
              <I18nLink href="/dashboard/downloads">{t("success.download")}</I18nLink>
            </Button>
            <Button variant="outline" asChild>
              <I18nLink href="/dashboard/orders">{t("success.orders")}</I18nLink>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">{t("billing")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nombre</Label>
                  <Input required placeholder="Tu nombre" {...register("name")} />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input required type="email" placeholder="tu@email.com" {...register("email")} />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label>Dirección</Label>
                  <Input placeholder="Calle, número, ciudad" {...register("address")} />
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input placeholder="Madrid" {...register("city")} />
                </div>
                <div>
                  <Label>Código postal</Label>
                  <Input placeholder="28001" {...register("zip")} />
                </div>
                <div>
                  <Label>País</Label>
                  <Input placeholder="España" {...register("country")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{t("payment")}</h2>
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="size-3.5" />
                  <span>Pago seguro SSL</span>
                </div>
              </div>

              {availableMethods.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded-md">
                  No hay métodos de pago disponibles en este momento.
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        method === m.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-border",
                      )}
                    >
                      <span className="text-2xl flex items-center justify-center">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      {method === m.id && <Check className="size-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Tu información está cifrada y segura
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">{t("summary")}</h2>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.license}`} className="flex justify-between gap-2">
                    <span className="line-clamp-1 text-muted-foreground">
                      {item.productTitle} <span className="text-xs">×{item.quantity}</span>
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-border/60 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold tabular-nums">{formatPrice(useCashback ? Math.max(subtotal - walletBalance, 0) : subtotal)}</span>
              </div>

              {walletBalance > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-brand-500/20 bg-brand-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-brand-500" />
                    <div>
                      <p className="text-sm font-medium">Saldo disponible</p>
                      <p className="text-lg font-bold text-brand-500">{formatPrice(walletBalance)}</p>
                    </div>
                  </div>
                  <Switch checked={useCashback} onCheckedChange={setUseCashback} />
                </div>
              )}
              <Button 
                type="submit" 
                variant="brand" 
                size="lg" 
                className="w-full" 
                loading={loading}
                disabled={availableMethods.length === 0}
              >
                {loading ? "Procesando..." : t("placeOrder")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
