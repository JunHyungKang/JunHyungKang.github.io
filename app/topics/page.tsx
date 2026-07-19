import type { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { getPostsForTopic, topics } from '@/lib/topics';

export const metadata: Metadata = {
  title: 'AI 엔지니어링 주제',
  description: 'AI 에이전트, 에이전트 하네스, LLM 엔지니어링 주제별 기술 글을 탐색하세요.',
  alternates: {
    canonical: 'https://junhyungkang.github.io/topics',
  },
};

export default function TopicsPage() {
  const posts = getSortedPostsData();

  return (
    <main className="min-h-screen bg-[#020617] px-6 pb-20 pt-32 text-slate-200">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">AI 엔지니어링 주제</h1>
          <p className="text-lg leading-relaxed text-slate-400">
            흩어진 글을 핵심 문제별로 묶었습니다. 개념 소개부터 직접 수행한 실험과 운영 회고까지 이어서 읽을 수 있습니다.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {topics.map((topic) => {
            const topicPosts = getPostsForTopic(posts, topic);
            return (
              <section key={topic.slug} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="mb-3 text-2xl font-bold text-white">
                  <Link href={`/topics/${topic.slug}`} className="hover:text-blue-400">
                    {topic.name}
                  </Link>
                </h2>
                <p className="mb-5 leading-relaxed text-slate-400">{topic.description}</p>
                <p className="mb-5 text-sm text-slate-500">관련 글 {topicPosts.length}편</p>
                <ul className="space-y-3">
                  {topicPosts.slice(0, 3).map((post) => (
                    <li key={post.slug}>
                      <Link href={`/posts/${post.slug}`} className="text-sm leading-snug text-slate-300 hover:text-blue-400">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/topics/${topic.slug}`} className="mt-6 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300">
                  {topic.name} 글 전체 보기 →
                </Link>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
