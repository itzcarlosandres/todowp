import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/shared/legal-page";
import { Users, Shield, Zap, Globe } from "lucide-react";

export default async function AboutPage() {
  const t = await getTranslations("legal.about");

  const values = [
    { icon: Users, key: "v1" },
    { icon: Shield, key: "v2" },
    { icon: Zap, key: "v3" },
    { icon: Globe, key: "v4" },
  ] as const;

  return (
    <LegalPage icon="about" title={t("title")} updated={t("subtitle")}>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("p1")}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("p2")}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("p3")}</p>

      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-base font-bold">{t("valuesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map(({ icon: Icon, key }) => (
            <div key={key} className="flex gap-3 rounded-xl border border-border/30 bg-muted/30 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10">
                <Icon className="size-4 text-brand-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t(`${key}Title`)}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(`${key}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-6 text-center">
        <h2 className="text-sm font-bold">{t("joinTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("joinContent")}</p>
      </div>
    </LegalPage>
  );
}
