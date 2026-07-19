import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import { getSortedPostsData } from '@/lib/posts';
import { getPostsForTopic, getTopicBySlug, topics } from '@/lib/topics';

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};

  return {
    title: topic.name,
    description: topic.description,
    alternates: {
      canonical: `https://junhyungkang.github.io/topics/${topic.slug}`,
    },
    openGraph: {
      title: `${topic.name} 기술 글`,
      description: topic.description,
      type: 'website',
      url: `https://junhyungkang.github.io/topics/${topic.slug}`,
    },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const posts = getPostsForTopic(getSortedPostsData(), topic);

  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-32 text-slate-200">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="이동 경로" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-400">홈</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <Link href="/topics" className="hover:text-blue-400">주제</Link>
        </nav>

        <header className="mb-12 max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{topic.name}</h1>
          <p className="text-lg leading-relaxed text-slate-400">{topic.description}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.slug}
              title={post.title}
              excerpt={post.teaser || `${topic.name} 관련 기술 글입니다.`}
              date={post.date}
              slug={post.slug}
              image={post.image}
              readingTime={post.readingTime}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
