import { db } from "@/lib/db";
import { CheckoutForm } from "./checkout-form";

import { setRequestLocale } from "next-intl/server";

export const metadata = {
  title: "Finalizar Compra | MarketFlow",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settingsList = await db.setting.findMany({
    where: {
      key: {
        in: [
          "payment_paypal_active",
          "payment_mp_active",
          "payment_coinpal_active",
          "payment_manual_active",
        ],
      },
    },
  });

  const activeMethods = {
    paypal: false,
    mercadopago: false,
    coinpal: false,
    manual: false,
  };

  settingsList.forEach((s) => {
    if (s.key === "payment_paypal_active" && s.value === "true") activeMethods.paypal = true;
    if (s.key === "payment_mp_active" && s.value === "true") activeMethods.mercadopago = true;
    if (s.key === "payment_coinpal_active" && s.value === "true") activeMethods.coinpal = true;
    if (s.key === "payment_manual_active" && s.value === "true") activeMethods.manual = true;
  });

  return <CheckoutForm activeMethods={activeMethods} />;
}
