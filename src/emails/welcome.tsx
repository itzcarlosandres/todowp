import { EmailLayout } from "./email-layout";
import { Text, Button, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`¡Bienvenido a bordo, ${name}!`}>
      <Text className="m-0 text-xl font-bold text-gray-900">
        ¡Bienvenido, {name}!
      </Text>
      <Text className="mt-4 text-base leading-6 text-gray-600">
        Gracias por registrarte en TodoWP. Ahora formas parte de la comunidad de creadores
        y profesionales más grande del mundo.
      </Text>
      <Text className="mt-3 text-base leading-6 text-gray-600">
        Explora nuestro catálogo de themes, plugins, scripts y SaaS starters. Encuentra
        las herramientas perfectas para tu próximo proyecto.
      </Text>
      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/products`}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700"
      >
        Explorar productos
      </Button>
      <Hr className="my-6 border-gray-200" />
      <Text className="text-xs text-gray-400">
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </Text>
    </EmailLayout>
  );
}
