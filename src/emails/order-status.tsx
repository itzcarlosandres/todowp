import { EmailLayout } from "./email-layout";
import { Section, Text, Button, Column, Row } from "@react-email/components";

interface OrderStatusEmailProps {
  name: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PAID: { bg: "#ecfdf5", text: "#065f46" },
  PENDING: { bg: "#fef3c7", text: "#92400e" },
  PROCESSING: { bg: "#e0e7ff", text: "#3730a3" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
  REFUNDED: { bg: "#fee2e2", text: "#991b1b" },
};

export function OrderStatusEmail({ name, orderNumber, status, statusLabel }: OrderStatusEmailProps) {
  const colors = STATUS_COLORS[status] ?? { bg: "#f3f4f6", text: "#374151" };

  return (
    <EmailLayout preview={`Pedido #${orderNumber} - ${statusLabel}`}>
      <Text className="m-0 text-xl font-bold text-gray-900">
        Actualización de pedido
      </Text>
      <Text className="mt-4 text-base leading-6 text-gray-600">
        Hola {name}, el estado de tu pedido <strong>#{orderNumber}</strong> ha cambiado.
      </Text>

      <Section className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Row>
          <Column className="w-full">
            <Text className="m-0 text-sm text-gray-600">Estado actual</Text>
          </Column>
          <Column align="right">
            <Text
              className="m-0 inline-block rounded-full px-3 py-1 text-sm font-bold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {statusLabel}
            </Text>
          </Column>
        </Row>
      </Section>

      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders`}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Ver mis pedidos
      </Button>
    </EmailLayout>
  );
}
