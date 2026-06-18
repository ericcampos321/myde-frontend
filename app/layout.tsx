import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Myde Inbox",
  description: "Desafio técnico frontend Myde",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Mobile: o teclado nativo deve ENCOLHER o layout viewport (não só o visual).
  // Assim `100dvh` e `--app-viewport-height` reduzem junto e o composer fica colado
  // acima do teclado, sem o espaço vazio escuro. No desktop é no-op (sem teclado
  // virtual). Sem isto, o Android encolhe só o visual viewport e o container não
  // acompanha — origem do gap entre composer e teclado.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
