"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/format";
import { Link as I18nLink } from "@/i18n/routing";
import Link from "next/link";

export function CartDrawer() {
  const t = useTranslations("cart");
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((acc, i) => acc + (i.salePrice ?? i.price) * i.quantity, 0);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-border/60 bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4" />
                <h2 className="font-semibold">{t("title")}</h2>
                <span className="text-sm text-muted-foreground">
                  ({items.length} {t("items")})
                </span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Cerrar">
                <X className="size-4" />
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="rounded-full bg-muted p-6">
                  <ShoppingBag className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{t("empty")}</p>
                </div>
                <Button variant="brand" onClick={close} asChild>
                  <I18nLink href="/products">{t("continueShopping")}</I18nLink>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li
                        key={`${item.productId}-${item.license}`}
                        className="flex gap-3 rounded-lg border border-border/60 bg-card p-3"
                      >
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={item.productImage}
                            alt={item.productTitle}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/product/${item.productSlug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm font-medium hover:underline"
                          >
                            {item.productTitle}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {item.license === "SINGLE" ? "Single" : "Unlimited"}
                          </span>
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-md border border-border/60">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.license, item.quantity - 1)
                                }
                                className="px-1.5 py-0.5 text-muted-foreground hover:text-foreground"
                                aria-label="Disminuir"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="min-w-[20px] text-center text-xs font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.license, item.quantity + 1)
                                }
                                className="px-1.5 py-0.5 text-muted-foreground hover:text-foreground"
                                aria-label="Aumentar"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatPrice(
                                (item.salePrice ?? item.price) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => remove(item.productId, item.license)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={t("remove")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/60 bg-muted/30 p-5">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("subtotal")}</span>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Button variant="brand" size="lg" className="w-full" asChild>
                    <I18nLink href="/checkout" onClick={close}>
                      {t("checkout")}
                      <ArrowRight className="ml-2 size-4" />
                    </I18nLink>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={clear}
                  >
                    Vaciar carrito
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
