import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sora antialiased bg-[var(--background)]"
      >
        {children}
      </body>
    </html>
  );
}
