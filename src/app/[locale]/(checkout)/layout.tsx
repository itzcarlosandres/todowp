import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

export const dynamic = "force-dynamic";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-[calc(100dvh-4rem)] bg-muted/20">{children}</main>
      <Footer />
    </>
  );
}
