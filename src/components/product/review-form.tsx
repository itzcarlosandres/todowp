"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "./star-rating-input";
import { createReviewAction } from "@/modules/products/actions";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ReviewForm({ productId, disabled = false, disabledMessage }: ReviewFormProps) {
  const t = useTranslations("product.reviews");
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (rating < 1 || rating > 5) nextErrors.rating = t("ratingRequired");
    if (title.trim().length < 3) nextErrors.title = t("titleTooShort");
    if (title.trim().length > 120) nextErrors.title = t("titleTooLong");
    if (body.trim().length < 10) nextErrors.body = t("bodyTooShort");
    if (body.trim().length > 2000) nextErrors.body = t("bodyTooLong");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await createReviewAction({
      productId,
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success(t("success"));
      setRating(0);
      setTitle("");
      setBody("");
      setErrors({});
      router.refresh();
    } else {
      toast.error(result.error ?? t("error"));
    }
  };

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {disabledMessage ?? t("loginToReview")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
      <div>
        <Label htmlFor="review-rating">{t("ratingLabel")}</Label>
        <div className="mt-2">
          <StarRatingInput value={rating} onChange={setRating} />
        </div>
        {errors.rating && <p className="mt-1 text-xs text-destructive">{errors.rating}</p>}
      </div>

      <div>
        <Label htmlFor="review-title">{t("titleLabel")}</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          maxLength={120}
          error={errors.title}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="review-body">{t("bodyLabel")}</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("bodyPlaceholder")}
          rows={4}
          maxLength={2000}
          error={errors.body}
          className="mt-2"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {body.length}/2000
        </p>
      </div>

      <Button type="submit" variant="brand" loading={isSubmitting} className="w-full sm:w-auto">
        {t("submit")}
      </Button>
    </form>
  );
}
