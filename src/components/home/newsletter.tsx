"use client";

import * as React from "react";
import { Mail, Check, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section, SectionHeader } from "@/components/shared/section";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Introduce un email válido");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubscribed(true);
    toast.success("¡Gracias por suscribirte!");
  };

  return (
    <Section>
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-brand-500/10 via-card to-card p-8 md:p-12">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
            <Sparkles className="size-3" />
            Newsletter
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            No te pierdas nada
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
            Recibe las últimas novedades, ofertas exclusivas y nuevos productos directamente en tu correo.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-5 py-2.5 text-sm font-medium text-success"
            >
              <Check className="size-4" />
              ¡Gracias por suscribirte!
            </motion.div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="h-11 pl-10"
                  required
                />
              </div>
              <Button type="submit" variant="brand" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Suscribirme"
                )}
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Respetamos tu privacidad. Puedes darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </Section>
  );
}
