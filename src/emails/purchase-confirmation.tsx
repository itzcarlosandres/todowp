import { EmailLayout } from "./email-layout";
import { Section, Text, Button, Hr, Column, Row } from "@react-email/components";
import { formatPrice } from "@/lib/format";

interface PurchaseItem {
  title: string;
  downloadUrl?: string;
  price?: number;
  currency?: string;
}

interface PurchaseConfirmationEmailProps {
  name: string;
  orderNumber: string;
  total: number;
  currency?: string;
  items: PurchaseItem[];
  downloadAllUrl: string;
}

export function PurchaseConfirmationEmail({
  name,
  orderNumber,
  total,
  currency = "USD",
  items,
  downloadAllUrl,
}: PurchaseConfirmationEmailProps) {
  return (
    <EmailLayout preview={`¡Gracias por tu compra! Pedido #${orderNumber}`}>
      <Text className="m-0 text-xl font-bold text-gray-900">
        ¡Gracias por tu compra, {name}!
      </Text>
      <Text className="mt-3 text-base leading-6 text-gray-600">
        Tu pedido <strong>#{orderNumber}</strong> fue procesado exitosamente.
        Tus productos están listos para descargar.
      </Text>

      <Section className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Text className="m-0 text-sm font-bold text-gray-700">
          Resumen del pedido
        </Text>
        {items.map((item, i) => (
          <Row key={i} className="mt-3">
            <Column className="w-full">
              <Text className="m-0 text-sm font-medium text-gray-700">
                {item.title}
              </Text>
              {item.downloadUrl && (
                <Text className="m-0 mt-1">
                  <a href={item.downloadUrl} className="text-xs text-violet-600 underline">
                    Descargar
                  </a>
                </Text>
              )}
            </Column>
            <Column align="right">
              <Text className="m-0 text-sm font-semibold text-gray-700">
                {item.price != null ? formatPrice(item.price, { currency: item.currency ?? currency }) : ""}
              </Text>
            </Column>
          </Row>
        ))}
        <Hr className="my-3 border-gray-200" />
        <Row>
          <Column className="w-full">
            <Text className="m-0 text-sm font-bold text-gray-900">Total</Text>
          </Column>
          <Column align="right">
            <Text className="m-0 text-lg font-extrabold text-violet-600">
              {formatPrice(total, { currency })}
            </Text>
          </Column>
        </Row>
      </Section>

      <Button
        href={downloadAllUrl}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Ir a mis descargas
      </Button>

      <Hr className="my-6 border-gray-200" />
      <Text className="text-xs text-gray-400">
        Tus descargas están disponibles en tu panel de usuario. Si tienes dudas, responde este correo.
      </Text>
    </EmailLayout>
  );
}
