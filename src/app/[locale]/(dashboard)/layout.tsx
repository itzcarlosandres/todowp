import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="min-h-[calc(100dvh-4rem)] bg-muted/20">{children}</main>
      <Footer />
    </>
  );
}
