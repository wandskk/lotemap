import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoteMap",
  description: "SaaS para gestão e exposição comercial de loteamentos.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
