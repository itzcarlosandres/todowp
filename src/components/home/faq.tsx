"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/section";
import { faqJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "¿Cómo descargo mis productos?",
    answer:
      "Después de comprar, recibirás un email con los enlaces de descarga. También puedes acceder a ellos en cualquier momento desde tu panel de usuario en la sección 'Descargas'.",
  },
  {
    question: "¿Las licencias tienen caducidad?",
    answer:
      "No, todas las licencias son perpetuas. Compras una vez y puedes usar el producto para siempre, incluyendo todas las actualizaciones futuras.",
  },
  {
    question: "¿Puedo usar los productos en proyectos comerciales?",
    answer:
      "Sí, todas nuestras licencias permiten el uso comercial. La licencia individual es para un sitio y la ilimitada para proyectos ilimitados.",
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer:
      "Sí, ofrecemos soporte premium por 6 meses incluido con cada compra. Puedes ampliar el soporte en cualquier momento.",
  },
  {
    question: "¿Cómo funcionan las actualizaciones?",
    answer:
      "Las actualizaciones son gratuitas de por vida. Te notificaremos por email cada vez que haya una nueva versión disponible.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjeta de crédito/débito (Stripe), PayPal, MercadoPago, Binance Pay, criptomonedas y transferencia bancaria.",
  },
];

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <Section>
      <SectionHeader
        title="Preguntas frecuentes"
        subtitle="Resolvemos tus dudas"
        align="center"
        badge={
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="size-3.5" /> FAQ
          </span>
        }
      />

      <div className="mx-auto max-w-3xl space-y-2">
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="overflow-hidden rounded-xl border border-border/60 bg-card"
          >
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-accent/50"
              aria-expanded={open === idx}
            >
              <span className="text-sm font-semibold md:text-base">{faq.question}</span>
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 transition-colors",
                  open === idx && "border-brand-500/50 bg-brand-500/10 text-brand-500",
                )}
              >
                {open === idx ? <Minus className="size-4" /> : <Plus className="size-4" />}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {open === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="border-t border-border/40 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
    </Section>
  );
}
