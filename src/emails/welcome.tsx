import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
  locale?: "es" | "en";
}

const translations = {
  es: {
    preview: "Bienvenido a MarketFlow",
    title: "¡Bienvenido a bordo!",
    body: "Nos alegra tenerte aquí. Ya puedes empezar a explorar nuestro catálogo de productos premium, descargar tus compras y mucho más.",
    cta: "Ir a mi panel",
    signature: "El equipo de MarketFlow",
  },
  en: {
    preview: "Welcome to MarketFlow",
    title: "Welcome aboard!",
    body: "We're glad to have you here. You can start exploring our premium product catalog, downloading your purchases and much more.",
    cta: "Go to my dashboard",
    signature: "The MarketFlow team",
  },
} as const;

export function WelcomeEmail({ name, loginUrl, locale = "es" }: WelcomeEmailProps) {
  const t = translations[locale];
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{t.preview}</Preview>
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
            <Heading className="text-2xl font-bold text-gray-900">{t.title}</Heading>
            <Text className="text-base text-gray-700">Hola {name},</Text>
            <Text className="text-base text-gray-700">{t.body}</Text>
            <Section className="my-6 text-center">
              <Button
                href={loginUrl}
                className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white"
              >
                {t.cta}
              </Button>
            </Section>
            <Text className="text-base text-gray-700">— {t.signature}</Text>
            <Hr className="my-6 border-gray-200" />
            <Text className="text-xs text-gray-500">
              Recibiste este email porque te registraste en MarketFlow. Si no fuiste tú, puedes ignorar este mensaje.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default WelcomeEmail;
