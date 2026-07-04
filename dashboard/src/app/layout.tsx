import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "💡 Capi (Config Archaeology) — Self-Improving Memory Layer",
  description: "Self-improving memory layer for your engineering team's config values. Unearth historical git blame, PR reasoning, and P1 outage reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${robotoMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07070a] text-[#f0f4f8]">{children}</body>
    </html>
  );
}
