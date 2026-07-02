import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandingForm } from "@/components/admin/settings/branding-form";
import { FaqForm } from "@/components/admin/settings/faq-form";
import { SmtpForm } from "@/components/admin/settings/smtp-form";
import { StorageForm } from "@/components/admin/settings/storage-form";
import { AiForm } from "@/components/admin/settings/ai-form";
import { PaymentsForm } from "@/components/admin/settings/payments-form";
import { MembershipForm } from "@/components/admin/settings/membership-form";
import { getMembershipSettings } from "@/components/admin/settings/membership-actions";
import { HeroForm } from "@/components/admin/settings/hero-form";
import { getHeroConfig } from "@/components/home/hero-actions";

import { setRequestLocale } from "next-intl/server";
import { unstable_cache } from "next/cache";

export const metadata = {
  title: "Configuración | Panel Admin",
};

const getAllSettings = unstable_cache(
  async () => {
    const settingsList = await db.setting.findMany();
    const settings: Record<string, any> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });
    return settings;
  },
  ["admin-all-settings"],
  { revalidate: 60 }
);

const getCategoriesForSettings = unstable_cache(
  async () => {
    return db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  },
  ["admin-settings-categories"],
  { revalidate: 60 }
);

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [settings, { plans }, categories, heroEs, heroEn] = await Promise.all([
    getAllSettings(),
    getMembershipSettings(),
    getCategoriesForSettings(),
    getHeroConfig("es"),
    getHeroConfig("en"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sitio</h1>
          <p className="mt-1 text-muted-foreground">Administra el diseño, pagos, membresías y textos globales.</p>
        </div>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="branding">Branding y Logo</TabsTrigger>
          <TabsTrigger value="hero">Hero / Inicio</TabsTrigger>
          <TabsTrigger value="memberships">Membresías</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento (R2)</TabsTrigger>
          <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
          <TabsTrigger value="ai">IA (Gemini)</TabsTrigger>
          <TabsTrigger value="faqs">Preguntas Frecuentes</TabsTrigger>
          <TabsTrigger value="smtp">Servidor SMTP</TabsTrigger>
        </TabsList>
        <TabsContent value="branding">
          <BrandingForm initialData={settings} />
        </TabsContent>
        <TabsContent value="hero">
          <HeroForm initialEs={heroEs} initialEn={heroEn} />
        </TabsContent>
        <TabsContent value="memberships">
          <MembershipForm categories={categories} plans={plans.map(p => ({...p, price: Number(p.price)}))} />
        </TabsContent>
        <TabsContent value="storage">
          <StorageForm initialData={settings} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsForm initialData={settings} />
        </TabsContent>
        <TabsContent value="ai">
          <AiForm initialData={settings} />
        </TabsContent>
        <TabsContent value="faqs">
          <FaqForm initialData={settings} />
        </TabsContent>
        <TabsContent value="smtp">
          <SmtpForm initialData={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
