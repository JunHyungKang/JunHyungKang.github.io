import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import GoogleAdSense from "@/components/GoogleAdSense";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getSortedPostsData } from "@/lib/posts";

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
    default: "JunHyung's Tech Log: AI Engineer",
    template: "%s | JH's Tech Log"
  },
  description: "AI Engineer. Specializing in LLMs, Deep Learning, and Generative AI.",
  keywords: ['AI', 'LLM', 'Deep Learning', 'Generative AI', 'JH Kang'],
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "JunHyung's Tech Log: AI Engineer",
    description: "AI Engineer. Specializing in LLMs, Deep Learning, and Generative AI.",
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
    other: {
      'naver-site-verification': '709e1e67071020d08f2120c1dd880624ed5321f8',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allPosts = getSortedPostsData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-slate-200 min-h-screen`}
        suppressHydrationWarning
      >
        <Navbar posts={allPosts} />
        {children}
        <GoogleAdSense pId="3166603343095810" />
      </body>
    </html>
  );
}
