import { EmailLayout } from "./email-layout";
import { Text, Button, Hr } from "@react-email/components";

interface ResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export function ResetPasswordEmail({ name, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Restablece tu contraseña">
      <Text className="m-0 text-xl font-bold text-gray-900">
        Restablecer contraseña
      </Text>
      <Text className="mt-4 text-base leading-6 text-gray-600">
        Hola {name}, recibiste este correo porque solicitaste restablecer tu contraseña.
        Haz clic en el botón para crear una nueva.
      </Text>
      <Button
        href={resetUrl}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Restablecer contraseña
      </Button>
      <Text className="mt-4 text-sm text-gray-500">
        O copia este enlace:
      </Text>
      <Text className="mt-1 break-all text-xs text-gray-400">
        {resetUrl}
      </Text>
      <Hr className="my-6 border-gray-200" />
      <Text className="text-xs text-gray-400">
        Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora el mensaje.
      </Text>
    </EmailLayout>
  );
}
