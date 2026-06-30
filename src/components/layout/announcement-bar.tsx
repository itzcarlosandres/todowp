"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const t = useTranslations("home");
  return (
    <div className="border-b border-border/40 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent">
      <div className="container-fluid flex items-center justify-center gap-2 py-2 text-center text-xs font-medium md:text-sm">
        <Sparkles className="size-3.5 text-brand-500" />
        <p className="text-pretty">{t("announcement")}</p>
      </div>
    </div>
  );
}
