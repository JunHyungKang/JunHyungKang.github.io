import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    default: "강준형의 AI 에이전트·LLM 엔지니어링 블로그",
    template: "%s | JH's Tech Log"
  },
  description: "AI 엔지니어 강준형이 직접 수행한 AI 에이전트, LLM, 딥러닝 실험과 개발 경험을 기록합니다.",
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: "강준형의 AI 에이전트·LLM 엔지니어링 블로그",
    description: "직접 수행한 AI 에이전트, LLM, 딥러닝 실험과 개발 경험을 기록합니다.",
    url: 'https://junhyungkang.github.io',
    siteName: "JunHyung's Tech Log",
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "강준형의 AI 에이전트·LLM 엔지니어링 블로그",
    description: "직접 수행한 AI 에이전트, LLM, 딥러닝 실험과 개발 경험을 기록합니다.",
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
  const identityJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://junhyungkang.github.io/about#person',
        name: 'JunHyung Kang',
        url: 'https://junhyungkang.github.io/about',
        jobTitle: 'Generative AI Engineer',
        sameAs: [
          'https://github.com/JunHyungKang',
          'https://www.linkedin.com/in/junhyung-kang-071605106/',
        ],
      },
      {
        '@type': 'Blog',
        '@id': 'https://junhyungkang.github.io/#blog',
        url: 'https://junhyungkang.github.io',
        name: "JunHyung's Tech Log",
        description: '강준형이 직접 구현하고 검증한 AI 에이전트·LLM 엔지니어링 기록',
        inLanguage: 'ko-KR',
        publisher: { '@id': 'https://junhyungkang.github.io/about#person' },
      },
    ],
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-slate-200 min-h-screen`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(identityJsonLd) }}
        />
        <Navbar posts={allPosts} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
