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
  metadataBase: new URL('https://junhyungkang.github.io'),
  title: {
    default: "JH Kang | AI Engineer & Full Stack Developer",
    template: "%s | JH Kang"
  },
  description: "Portfolio and Blog of JH Kang, an AI Engineer specializing in LLMs, Computer Vision, and Modern Web Development.",
  openGraph: {
    title: "JH Kang | AI Engineer & Full Stack Developer",
    description: "Portfolio and Blog of JH Kang, an AI Engineer specializing in LLMs, Computer Vision, and Modern Web Development.",
    url: 'https://junhyungkang.github.io',
    siteName: 'JH Kang Blog',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'z1Z2um-x26L98JN0Aaz0GGwzy801iZ_aiK3VT1pI9Js',
  },
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
