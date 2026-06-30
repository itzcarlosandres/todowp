import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import { formatPrice } from "@/lib/format";

interface PurchaseItem {
  title: string;
  price: number;
  salePrice?: number | null;
  license: string;
}

interface PurchaseConfirmationEmailProps {
  name: string;
  orderNumber: string;
  total: number;
  currency: string;
  items: PurchaseItem[];
  downloadUrl: string;
  locale?: "es" | "en";
}

const t = {
  es: {
    preview: "Confirmación de compra",
    title: "¡Gracias por tu compra!",
    body: "Hemos recibido tu pedido correctamente. Aquí tienes el resumen:",
    order: "Número de pedido",
    total: "Total",
    download: "Ir a mis descargas",
    invoice: "Ver factura",
    support: "Si tienes alguna pregunta, contacta con nuestro equipo de soporte.",
  },
  en: {
    preview: "Purchase confirmation",
    title: "Thanks for your purchase!",
    body: "We have received your order. Here is the summary:",
    order: "Order number",
    total: "Total",
    download: "Go to my downloads",
    invoice: "View invoice",
    support: "If you have any questions, contact our support team.",
  },
} as const;

export function PurchaseConfirmationEmail({
  name,
  orderNumber,
  total,
  currency,
  items,
  downloadUrl,
  locale = "es",
}: PurchaseConfirmationEmailProps) {
  const tr = t[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{tr.preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-0 max-w-[600px] bg-white p-8">
            <Section>
              <div className="mb-6 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                  <strong>M</strong>
                </div>
                <strong className="text-lg text-gray-900">MarketFlow</strong>
              </div>
            </Section>
            <Heading className="text-2xl font-bold text-gray-900">{tr.title}</Heading>
            <Text className="text-base text-gray-700">Hola {name},</Text>
            <Text className="text-base text-gray-700">{tr.body}</Text>

            <Section className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Text className="mb-2 text-sm text-gray-600">
                <strong>{tr.order}:</strong> #{orderNumber}
              </Text>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 text-gray-700">{item.title}</td>
                      <td className="py-2 text-right text-gray-900">
                        {formatPrice(item.salePrice ?? item.price, { currency, locale })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Hr className="my-3 border-gray-300" />
              <Text className="text-base">
                <strong>{tr.total}:</strong>{" "}
                <span className="font-bold text-purple-600">
                  {formatPrice(total, { currency, locale })}
                </span>
              </Text>
            </Section>

            <Section className="my-6 text-center">
              <Button
                href={downloadUrl}
                className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white"
              >
                {tr.download}
              </Button>
            </Section>

            <Text className="text-sm text-gray-600">{tr.support}</Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-xs text-gray-500">© MarketFlow</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PurchaseConfirmationEmail;
