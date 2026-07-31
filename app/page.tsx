import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import GoogleAdSense from '@/components/GoogleAdSense';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const featuredPost = allPostsData[0];
  const recentPosts = allPostsData.slice(1, 7); // Next 6 posts (2 rows of 3)
  const siteUrl = 'https://junhyungkang.github.io';
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: "JH's Tech Log",
    alternateName: '강준형의 AI 엔지니어링 블로그',
    inLanguage: 'ko-KR',
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <GoogleAdSense pId="3166603343095810" />

      <section className="px-6 pt-32">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-8 md:px-10">
          <p className="mb-3 text-sm font-medium tracking-wider text-blue-400">JH&apos;S TECH LOG</p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white md:text-4xl">
            AI 에이전트와 LLM 시스템을 직접 만들고 검증하며 배운 판단을 기록합니다.
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-400">
            공식 문서의 단순 요약보다 재현 가능한 실험, 운영 중 실패한 선택, 실제로 바뀐 설계와 한계를 남깁니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/about" className="font-medium text-blue-400 hover:text-blue-300">작성자 소개 →</Link>
            <Link href="/editorial-policy" className="font-medium text-blue-400 hover:text-blue-300">작성·검증 원칙 →</Link>
          </div>
        </div>
      </section>

      {/* Featured Post Hero */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-blue-400 font-medium tracking-wider text-sm">주요 글</span>
        </div>

        {featuredPost ? (
          <Link href={`/posts/${featuredPost.slug}`} className="group block">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-blue-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-xl text-slate-400 mb-8 leading-relaxed line-clamp-3">
                  {featuredPost.teaser || "Read the latest insights and tutorials on AI, Engineering, and Tech."}
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                  글 읽기 <ArrowRight size={20} />
                </div>
              </div>

              <div className="order-1 md:order-2 relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl group-hover:shadow-blue-900/20 transition-all">
                {featuredPost.image ? (
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono">
                      {featuredPost.date}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-center py-20 text-slate-500">No posts found.</div>
        )}
      </section>

      {/* Recent Articles Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold text-white">최근 글</h2>
          <Link href="/posts" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
            전체 글 보기 <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map(({ slug, date, title, teaser, image, readingTime }) => (
            <ArticleCard
              key={slug}
              title={title}
              excerpt={teaser || "No description available."}
              date={date}
              slug={slug}
              image={image}
              readingTime={readingTime}
            />
          ))}
        </div>
      </section>

      {/* Secondary Projects Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">주요 프로젝트</h2>
              <p className="text-slate-400 text-sm">직접 만들고 운영한 공개 프로젝트를 소개합니다.</p>
            </div>
            <Link href="/projects" className="text-slate-400 hover:text-white text-sm font-medium">
              프로젝트 전체 보기 →
            </Link>
          </div>

          <Link href="/projects" className="group block p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">프로젝트 포트폴리오</h3>
                <p className="text-slate-400">배포한 도구와 오픈소스 프로젝트의 문제·역할·검증 결과를 확인하세요.</p>
              </div>
              <ArrowRight className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
