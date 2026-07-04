import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAPI — Config Archaeology Investigation Board",
  description: "Detective investigation board meets Vegas crime scene meets developer terminal. Unearth why config values exist before touching them breaks production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f0] font-sans selection:bg-[#f5a623]/30 selection:text-[#f5a623]">
        <Navbar />
        <main className="flex-1 pt-16 flex flex-col items-center">
          <div className="w-full max-w-[1200px] px-4 md:px-8 py-8 flex-1 flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
