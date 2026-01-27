import type { Metadata } from "next";
import { Bebas_Neue, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Sebastián Escalona | Tienda Automotriz",
  description:
    "Accesorios racing, repuestos originales y productos destacados para tu vehículo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${sora.variable} ${bebasNeue.variable} antialiased bg-[var(--background)]`}
      >
        {children}
      </body>
    </html>
  );
}
