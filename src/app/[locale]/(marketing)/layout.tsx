import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { TopBar } from "@/components/layout/top-bar";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settingsList = await db.setting.findMany({
    where: {
      key: {
        in: [
          "promo_bar_active",
          "promo_bar_text",
          "promo_bar_subtext",
          "promo_bar_countdown",
          "promo_bar_button_text",
          "promo_bar_button_link",
        ],
      },
    },
  });

  const getSetting = (key: string, fallback: string) => {
    const setting = settingsList.find((s) => s.key === key);
    return setting ? String(setting.value ?? fallback) : fallback;
  };

  const isActive = getSetting("promo_bar_active", "false") === "true";
  
  return (
    <>
      {isActive ? (
        <TopBar 
          text={getSetting("promo_bar_text", "Lifetime Premium — 30% OFF")}
          subtext={getSetting("promo_bar_subtext", "5 licencias incluidas")}
          countdown={getSetting("promo_bar_countdown", "")}
          buttonText={getSetting("promo_bar_button_text", "Get It Now")}
          buttonLink={getSetting("promo_bar_button_link", "/membership")}
        />
      ) : (
        <AnnouncementBar />
      )}
      <Header />
      <CartDrawer />
      <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
