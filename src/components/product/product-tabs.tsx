"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { History, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { formatRelativeDate, formatDate } from "@/lib/date";
import { ReviewForm } from "./review-form";
import type { ProductWithRelations } from "@/types/product";

interface ProductTabsProps {
  product: ProductWithRelations;
  canReview?: boolean;
  userHasReviewed?: boolean;
  isAuthenticated?: boolean;
}

export function ProductTabs({ product, canReview = false, userHasReviewed = false, isAuthenticated = false }: ProductTabsProps) {
  const t = useTranslations("product.tabs");
  const [descExpanded, setDescExpanded] = React.useState(false);
  const descText = product.description || "";
  const descShort = descText.length > 400 ? descText.slice(0, 400) + "..." : "";
  const hasMore = descText.length > 400;

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">{t("description")}</TabsTrigger>
        <TabsTrigger value="versions">{t("versions")}</TabsTrigger>
        <TabsTrigger value="reviews">{t("reviews")} ({product.reviewCount})</TabsTrigger>
        <TabsTrigger value="changelog">{t("changelog")}</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-6">
        <div
          className={`prose-content max-w-none relative ${
            !descExpanded && hasMore
              ? "max-h-[400px] overflow-hidden"
              : "max-h-[5000px]"
          } transition-all duration-700 ease-in-out`}
        >
          {(!descExpanded && hasMore ? descShort : descText).split("\n").map((line, i) => {
            if (line.startsWith("## "))
              return (
                <h2 key={i}>{line.replace("## ", "")}</h2>
              );
            if (line.startsWith("# "))
              return (
                <h1 key={i}>{line.replace("# ", "")}</h1>
              );
            if (line.startsWith("- "))
              return <li key={i}>{line.replace("- ", "")}</li>;
            if (line.trim()) return <p key={i}>{line}</p>;
            return null;
          })}
          {!descExpanded && hasMore && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
          )}
        </div>
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-5 py-2 text-sm font-semibold text-brand-500 transition-all duration-300 hover:bg-brand-500/10 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10"
            >
              {descExpanded ? "Ver menos" : "Ver descripción completa"}
              <ChevronDown
                className={`size-4 transition-transform duration-500 ease-out ${descExpanded ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              />
            </button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="versions">
        <div className="space-y-3">
          {product.versions.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base font-semibold">v{v.version}</h3>
                  {v.isLatest && (
                    <Badge variant="brand" className="gap-1">
                      <Sparkles className="size-3" />
                      Latest
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(v.releasedAt, "PPP")}
                </span>
              </div>
              <div className="prose-content max-w-none text-sm">
                {v.changelog.split("\n").map((line, j) => {
                  if (line.startsWith("## "))
                    return <h4 key={j}>{line.replace("## ", "")}</h4>;
                  if (line.startsWith("### "))
                    return <h5 key={j}>{line.replace("### ", "")}</h5>;
                  if (line.startsWith("- "))
                    return <li key={j}>{line.replace("- ", "")}</li>;
                  if (line.trim()) return <p key={j}>{line}</p>;
                  return null;
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-6">
        {!isAuthenticated ? (
          <ReviewForm productId={product.id} disabled disabledMessage={t("loginToReview")} />
        ) : userHasReviewed ? (
          <ReviewForm productId={product.id} disabled disabledMessage={t("alreadyReviewed")} />
        ) : canReview ? (
          <ReviewForm productId={product.id} />
        ) : (
          <ReviewForm productId={product.id} disabled disabledMessage={t("purchaseToReview")} />
        )}

        {product.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border/60 bg-card p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-full bg-muted">
                    {review.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.user.image}
                        alt={review.user.name ?? "User"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-semibold">
                        {review.user.name?.charAt(0) ?? "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{review.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(review.createdAt)}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <h4 className="font-semibold">{review.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.body}</p>
                {review.verified && (
                  <Badge variant="success" className="mt-3">
                    ✓ Compra verificada
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="changelog">
        <div className="space-y-3">
          {product.versions.slice(0, 5).map((v) => (
            <details
              key={v.id}
              className="group rounded-xl border border-border/60 bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold">v{v.version}</span>
                  {v.isLatest && <Badge variant="brand">Latest</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(v.releasedAt)}
                </span>
              </summary>
              <div className="border-t border-border/40 p-4 text-sm">
                <pre className="whitespace-pre-wrap font-sans text-foreground/90">
                  {v.changelog}
                </pre>
              </div>
            </details>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
