import { getTranslations } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/shared/legal-page";

export default async function CookiesPage() {
  const t = await getTranslations("legal.cookies");

  return (
    <LegalPage icon="cookies" title={t("title")} updated={`${t("lastUpdated")}: 01/06/2026`}>
      <LegalSection label="01" title={t("s1Title")}><p>{t("s1Content")}</p></LegalSection>
      <LegalSection label="02" title={t("s2Title")}><p>{t("s2Content")}</p></LegalSection>
      <LegalSection label="03" title={t("s3Title")}><p>{t("s3Content")}</p></LegalSection>
      <LegalSection label="04" title={t("s4Title")}><p>{t("s4Content")}</p></LegalSection>
    </LegalPage>
  );
}
