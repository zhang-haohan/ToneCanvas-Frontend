import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PointerProvider } from "../contexts/PointerContext"; // 引入 PointerProvider
import { AudioProvider } from "../contexts/AudioContext";
import { AudioRangeProvider } from "../contexts/AudioRange";
import { CorpusStatusProvider } from "../contexts/CorpusStatus"; // 引入 CorpusStatusProvider
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
        <AudioRangeProvider>
          <AudioProvider>
            <PointerProvider>
              <CorpusStatusProvider> {/* 包裹 children */}
                {children}
              </CorpusStatusProvider>
            </PointerProvider>
          </AudioProvider>
        </AudioRangeProvider>
      </body>
    </html>
  );
}
