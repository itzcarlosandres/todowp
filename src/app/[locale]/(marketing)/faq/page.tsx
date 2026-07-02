import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/shared/legal-page";

export default async function FAQPage() {
  const t = await getTranslations("faq");

  return (
    <LegalPage icon="faq" title={t("title")} updated={t("subtitle")}>
      <div className="grid gap-4">
        {t.raw("items").map((item: { question: string; answer: string }, i: number) => (
          <LegalSection key={i} label={`${i + 1}`.padStart(2, "0")} title={item.question}>
            <p>{item.answer}</p>
          </LegalSection>
        ))}
      </div>

      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5 text-center">
        <p className="text-sm text-muted-foreground">
          ¿No encuentras lo que buscas?{" "}
          <a href="mailto:contact@todowp.dev" className="font-medium text-brand-500 hover:underline">
            Contáctanos
          </a>
        </p>
      </div>
    </LegalPage>
  );
}
