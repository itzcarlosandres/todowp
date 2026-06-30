"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import { activateMembership } from "./actions";
import { useRouter } from "@/i18n/routing";

import { cn } from "@/lib/utils";
import { Link as I18nLink } from "@/i18n/routing";

interface MembershipCheckoutFormProps {
  planId: string;
  price: number;
  activeMethods: {
    paypal: boolean;
    mercadopago: boolean;
    coinpal: boolean;
    manual: boolean;
  };
}

export function MembershipCheckoutForm({ planId, price, activeMethods }: MembershipCheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const availableMethods = [];
  if (activeMethods.paypal) {
    availableMethods.push({ id: "paypal", name: "PayPal", icon: "🅿️", desc: "Pago rápido y seguro" });
  }
  if (activeMethods.mercadopago) {
    availableMethods.push({ id: "mercadopago", name: "MercadoPago", icon: "💙", desc: "Tarjetas y efectivo" });
  }
  if (activeMethods.coinpal) {
    availableMethods.push({ id: "coinpal", name: "Criptomonedas", icon: <CreditCard className="size-6 text-brand-500" />, desc: "Paga con cripto" });
  }
  if (activeMethods.manual) {
    availableMethods.push({ id: "manual", name: "Transferencia bancaria", icon: <CreditCard className="size-6 text-brand-500" />, desc: "Pago manual" });
  }

  const initialMethod = availableMethods.length > 0 ? availableMethods[0]?.id ?? "" : "";
  const [method, setMethod] = useState<string>(initialMethod);

  const handleCheckout = async () => {
    if (!method) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/checkout/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "membership", planId, subtotal: price }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        setSuccess(true);
        toast.success("¡Tu pedido fue recibido! Si fue transferencia, espera confirmación.");
      } else {
        toast.error(data.error || "Ocurrió un error al procesar el pago.");
      }
    } catch (err: any) {
      toast.error("Error de conexión al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="size-6" />
        </div>
        <h3 className="text-xl font-bold mb-2">¡Pedido procesado con éxito!</h3>
        <p className="text-muted-foreground mb-6">Tu membresía será activada pronto (o ya está activa si pagaste en línea).</p>
        <Button asChild variant="brand"><I18nLink href="/dashboard">Ir a mi Panel</I18nLink></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {availableMethods.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded-md">
          No hay métodos de pago disponibles en este momento.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1">
          {availableMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                method === m.id
                  ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                  : "border-border/60 hover:border-border",
              )}
            >
              <span className="text-2xl flex items-center justify-center w-8">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              {method === m.id && <Check className="size-4 text-brand-500" />}
            </button>
          ))}
        </div>
      )}

      <Button 
        className="w-full h-12 text-lg font-bold" 
        variant="brand" 
        onClick={handleCheckout} 
        disabled={loading || availableMethods.length === 0}
      >
        {loading ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
        Pagar ${price} y Activar
      </Button>
    </div>
  );
}
