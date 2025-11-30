import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAdSense from "@/components/GoogleAdSense";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "기록으로 살아남기",
  description: "JH Kang's Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-slate-200 min-h-screen`}
        suppressHydrationWarning
      >
        {children}
        <GoogleAdSense pId="YOUR_ADSENSE_ID_HERE" />
      </body>
    </html>
  );
}
