// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import { CartProvider } from "@/app/context/CartContext";
import { ToastProvider } from "@/app/context/ToastContext"; // ✅ Tambahkan ini
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const work = Work_Sans({ subsets: ["latin"], variable: "--font-work" });

export const metadata: Metadata = {
  title: "Ruang Baca JDIH KPU",
  description:
    "Sistem Informasi Ruang Baca JDIH KPU Provinsi Kalimantan Tengah",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} ${work.variable} font-body-md text-body-md min-h-screen flex flex-col`}
      >
        <ToastProvider>
          {" "}
          {/* ✅ Tambahkan ini */}
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
