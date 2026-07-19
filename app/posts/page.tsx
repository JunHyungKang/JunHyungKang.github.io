import { getSortedPostsData } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import { Metadata } from 'next';
import GoogleAdSense from '@/components/GoogleAdSense';
import Link from 'next/link';
import { topics } from '@/lib/topics';

export const metadata: Metadata = {
    title: 'AI 엔지니어링 글',
    description: 'AI 에이전트, LLM, 딥러닝과 개발 경험을 다룬 강준형의 기술 글 전체 목록입니다.',
};

export default function BlogIndex() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            <GoogleAdSense pId="3166603343095810" />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI 엔지니어링 글</h1>
                    <p className="text-slate-400 text-lg">직접 수행한 실험, 구현 경험과 기술 분석을 모았습니다.</p>
                    <div className="mt-6 flex flex-wrap gap-2" aria-label="주제별 글 보기">
                        {topics.map((topic) => (
                            <Link
                                key={topic.slug}
                                href={`/topics/${topic.slug}`}
                                className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-blue-300 hover:border-blue-500/60 hover:text-blue-200"
                            >
                                {topic.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allPostsData.map(({ slug, date, title, teaser, image, readingTime }) => (
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
            </div>
        </main>
    );
}
