import { EmailLayout } from "./email-layout";
import { Text, Button, Hr } from "@react-email/components";

interface PasswordChangedEmailProps {
  name: string;
}

export function PasswordChangedEmail({ name }: PasswordChangedEmailProps) {
  return (
    <EmailLayout preview="Tu contraseña ha sido actualizada">
      <Text className="m-0 text-xl font-bold text-gray-900">
        Contraseña actualizada
      </Text>
      <Text className="mt-4 text-base leading-6 text-gray-600">
        Hola {name}, tu contraseña fue cambiada exitosamente.
      </Text>
      <Text className="mt-3 text-base leading-6 text-gray-600">
        Si no hiciste este cambio, contacta a nuestro equipo de soporte inmediatamente
        para proteger tu cuenta.
      </Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Ir a mi cuenta
      </Button>
      <Hr className="my-6 border-gray-200" />
      <Text className="text-xs text-gray-400">
        Si no realizaste este cambio, por favor contacta a soporte.
      </Text>
    </EmailLayout>
  );
}
