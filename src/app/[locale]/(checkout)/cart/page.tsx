"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Link as I18nLink } from "@/i18n/routing";
import { toast } from "sonner";

export default function CartPage() {
  const t = useTranslations("cart");
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((acc, i) => acc + (i.salePrice ?? i.price) * i.quantity, 0);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "WELCOME10") {
      setDiscount(subtotal * 0.1);
      toast.success("Cupón aplicado: 10% de descuento");
    } else if (coupon.toUpperCase() === "SAVE20") {
      setDiscount(subtotal * 0.2);
      toast.success("Cupón aplicado: 20% de descuento");
    } else {
      toast.error("Cupón inválido");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-fluid py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t("empty")}</h2>
            </div>
            <Button variant="brand" asChild>
              <I18nLink href="/products">{t("continueShopping")}</I18nLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = subtotal - discount;

  return (
    <div className="container-fluid py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.license}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <Card>
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.productImage}
                        alt={item.productTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="line-clamp-2 font-medium hover:underline"
                      >
                        {item.productTitle}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.license === "SINGLE" ? "Licencia individual" : "Licencia ilimitada"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-md border border-border/60">
                          <button
                            onClick={() => updateQuantity(item.productId, item.license, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-accent"
                            aria-label="Disminuir"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.license, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-accent"
                            aria-label="Aumentar"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="font-semibold tabular-nums">
                          {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(item.productId, item.license)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
            <X className="size-3.5" />
            Vaciar carrito
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">Resumen</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>{t("discount")}</span>
                    <span className="font-medium tabular-nums">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("tax")}</span>
                  <span className="text-muted-foreground">Calculado en checkout</span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("total")}</span>
                  <span className="text-xl font-bold tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("coupon")}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder={t("couponPlaceholder")}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={applyCoupon}>
                    {t("apply")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Prueba: <code className="rounded bg-muted px-1.5 py-0.5">WELCOME10</code> para 10% off
                </p>
              </div>

              <Button variant="brand" size="lg" className="w-full" asChild>
                <I18nLink href="/checkout">
                  {t("checkout")}
                  <ArrowRight className="ml-2 size-4" />
                </I18nLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
