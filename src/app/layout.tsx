import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { TakipListesiProvider } from "@/contexts/TakipListesiContext";
import DebugResetButton from "@/components/DebugResetButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Futbol Performans",
  description: "Futbolcu arama ve performans değerlendirme platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TakipListesiProvider>
          <div className="min-h-screen">
            <Navbar />
            <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
              {children}
            </main>
            <DebugResetButton />
          </div>
        </TakipListesiProvider>
      </body>
    </html>
  );
}
