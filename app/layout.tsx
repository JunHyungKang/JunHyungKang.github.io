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
    default: "JunHyung's Tech Log - AI Engineer & Full Stack Developer",
    template: "%s | JunHyung's Tech Log"
  },
  description: "Portfolio and Blog of JH Kang, an AI Engineer specializing in LLMs, Computer Vision, and Modern Web Development.",
  keywords: ['AI', 'Artificial Intelligence', 'LLM', 'Machine Learning', 'Web Development', 'Next.js', 'React', 'Tech Blog', 'JunHyung Kang', 'JH Kang'],
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "JunHyung's Tech Log - AI Engineer & Full Stack Developer",
    description: "Portfolio and Blog of JH Kang, an AI Engineer specializing in LLMs, Computer Vision, and Modern Web Development.",
    url: 'https://junhyungkang.github.io',
    siteName: "JunHyung's Tech Log",
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
    google: 'v3Z-XmqUqZk2FoPTkjOf-hMqHJqe_cDk6FprCXmMGts',
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
        <GoogleAdSense pId="3166603343095810" />
      </body>
    </html>
  );
}
