import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Archive',
    description: 'Archive of all articles, thoughts, and tutorials on AI and Web Development.',
};

export default function BlogIndex() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
                    <p className="text-slate-400 text-lg">All articles, thoughts, and tutorials.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allPostsData.map(({ slug, date, title, teaser }) => (
                        <ArticleCard
                            key={slug}
                            title={title}
                            excerpt={teaser || "No description available."}
                            date={date}
                            slug={slug}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
