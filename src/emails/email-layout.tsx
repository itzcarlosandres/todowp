import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  logoText?: string;
  appUrl?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function EmailLayout({ preview, children, logoText = "TodoWP", appUrl = BASE_URL }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f6f9] font-sans">
          <Container className="mx-auto max-w-[560px] px-4 py-8">
            <Section className="rounded-t-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-8 text-center">
              <Text className="m-0 text-2xl font-extrabold tracking-tight text-white">
                {logoText}
              </Text>
              <Text className="m-0 mt-1 text-sm font-medium text-white/70">
                Marketplace Premium
              </Text>
            </Section>

            <Section className="rounded-b-2xl border border-t-0 border-gray-200 bg-white px-8 py-8 shadow-sm">
              {children}
            </Section>

            <Section className="mt-8 text-center">
              <Text className="m-0 text-xs text-gray-400">
                © {new Date().getFullYear()} {logoText}. Todos los derechos reservados.
              </Text>
              <Text className="m-0 mt-2 text-xs text-gray-400">
                <Link href={`${appUrl}/terms`} className="text-gray-400 underline">Términos</Link>
                {" · "}
                <Link href={`${appUrl}/privacy`} className="text-gray-400 underline">Privacidad</Link>
                {" · "}
                <Link href={`${appUrl}/refund`} className="text-gray-400 underline">Reembolsos</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
