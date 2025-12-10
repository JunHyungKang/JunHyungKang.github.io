import { getAllPostIds, getPostData, getPostMetadata } from '@/lib/posts';
import Comments from '@/components/Comments';
import TableOfContents from '@/components/TableOfContents';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => path.params);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const postData = getPostMetadata(slug);

    return {
        title: postData.title,
        description: postData.teaser || `Read ${postData.title} on JunHyung's Tech Log`,
        openGraph: {
            title: postData.title,
            description: postData.teaser || `Read ${postData.title} on JunHyung's Tech Log`,
            type: 'article',
            publishedTime: postData.date,
            url: `https://junhyungkang.github.io/posts/${slug}`,
            images: postData.image ? [postData.image] : [],
            authors: ['JunHyung Kang'],
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const siteUrl = 'https://junhyungkang.github.io';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: postData.title,
        datePublished: postData.date,
        dateModified: postData.date,
        description: postData.teaser || `Read ${postData.title} on JunHyung's Tech Log`,
        image: postData.image ? [postData.image] : [],
        url: `${siteUrl}/posts/${slug}`,
        author: {
            '@type': 'Person',
            name: 'JunHyung Kang',
            url: siteUrl,
        },
    };

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-4 gap-12">
                
                {/* Main Content */}
                <article className="xl:col-span-3 max-w-3xl mx-auto w-full">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                    <header className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{postData.title}</h1>
                        <div className="text-slate-400 text-sm">{postData.date}</div>
                    </header>
                    
                    <section
                        className="prose prose-invert max-w-none text-slate-300 
                        prose-headings:text-white prose-headings:font-bold prose-headings:scroll-mt-32
                        prose-a:text-blue-400 hover:prose-a:text-blue-300 
                        prose-strong:text-white 
                        prose-code:text-blue-300 prose-code:bg-slate-900/50 prose-code:px-1 prose-code:rounded
                        prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800"
                        dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                    />
                    <Comments />
                </article>

                {/* Sidebar (TOC) */}
                <aside className="hidden xl:block xl:col-span-1">
                    <div className="sticky top-32">
                        <TableOfContents headings={postData.headings || []} />
                    </div>
                </aside>

            </div>
        </main>
    );
}
