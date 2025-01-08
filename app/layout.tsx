import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PointerProvider } from "../contexts/PointerContext"; // 引入 PointerProvider
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tone Canvas",
  description: "The Frontend Part of Tone Canvas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PointerProvider> {/* 使用 PointerProvider 包裹 children */}
          {children}
        </PointerProvider>
      </body>
    </html>
  );
}
