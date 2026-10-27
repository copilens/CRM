import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copilens",
  description: "CRM Pessoal & Comercial para gestão de clientes, funil, reuniões e faturamento em Kz",
  icons: {
    icon: "/img/5.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <body className="antialiased bg-white text-[#14150f]">{children}</body>
    </html>
  );
}
