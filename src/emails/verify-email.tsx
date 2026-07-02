import { EmailLayout } from "./email-layout";
import { Text, Button, Hr } from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verifica tu dirección de email">
      <Text className="m-0 text-xl font-bold text-gray-900">
        Verifica tu email, {name}
      </Text>
      <Text className="mt-4 text-base leading-6 text-gray-600">
        Gracias por registrarte. Para activar tu cuenta y empezar a comprar,
        verifica tu dirección de correo electrónico.
      </Text>
      <Button
        href={verifyUrl}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Verificar email
      </Button>
      <Text className="mt-4 text-sm text-gray-500">
        O copia y pega este enlace en tu navegador:
      </Text>
      <Text className="mt-1 break-all text-xs text-gray-400">
        {verifyUrl}
      </Text>
      <Hr className="my-6 border-gray-200" />
      <Text className="text-xs text-gray-400">
        Este enlace expira en 24 horas. Si no solicitaste esta verificación, ignora este mensaje.
      </Text>
    </EmailLayout>
  );
}
