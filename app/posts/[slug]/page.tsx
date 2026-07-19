import { getAllPostIds, getPostData, getPostMetadata, getRelatedPosts } from '@/lib/posts';
import Comments from '@/components/Comments';
import TableOfContents from '@/components/TableOfContents';
import ShareButtons from '@/components/ShareButtons';
import RelatedPosts from '@/components/RelatedPosts';
import { Metadata } from 'next';
import GoogleAdSense from '@/components/GoogleAdSense';
import Link from 'next/link';
import { getTopicsForTags } from '@/lib/topics';

const siteUrl = 'https://junhyungkang.github.io';

function toAbsoluteUrl(url?: string) {
    return url ? new URL(url, siteUrl).toString() : undefined;
}

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => path.params);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const postData = getPostMetadata(slug);
    const imageUrl = toAbsoluteUrl(postData.image);
    const description = postData.teaser || `강준형의 기술 블로그에서 ${postData.title} 글을 읽어보세요.`;

    return {
        title: postData.title,
        description,
        alternates: {
            canonical: `https://junhyungkang.github.io/posts/${slug}`,
        },
        robots: postData.noindex ? {
            index: false,
            follow: true,
        } : undefined,
        openGraph: {
            title: postData.title,
            description,
            type: 'article',
            publishedTime: postData.date,
            modifiedTime: postData.updated || postData.date,
            url: `https://junhyungkang.github.io/posts/${slug}`,
            images: imageUrl ? [imageUrl] : [],
            authors: ['JunHyung Kang'],
        },
        twitter: {
            card: 'summary_large_image',
            title: postData.title,
            description,
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const relatedPosts = getRelatedPosts(slug, postData.tags || [], 3);
    const postTopics = getTopicsForTags(postData.tags);
    const canonicalUrl = `${siteUrl}/posts/${slug}`;
    const imageUrl = toAbsoluteUrl(postData.image);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': `${canonicalUrl}#article`,
                mainEntityOfPage: canonicalUrl,
                headline: postData.title,
                datePublished: postData.date,
                dateModified: postData.updated || postData.date,
                description: postData.teaser || `강준형의 기술 블로그에서 ${postData.title} 글을 읽어보세요.`,
                ...(imageUrl ? { image: [imageUrl] } : {}),
                url: canonicalUrl,
                inLanguage: 'ko-KR',
                author: {
                    '@type': 'Person',
                    name: 'JunHyung Kang',
                    url: `${siteUrl}/about`,
                },
                publisher: {
                    '@type': 'Person',
                    name: 'JunHyung Kang',
                    url: `${siteUrl}/about`,
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: '홈',
                        item: siteUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: '글',
                        item: `${siteUrl}/posts`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: postData.title,
                        item: canonicalUrl,
                    },
                ],
            },
        ],
    };

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 pt-24 pb-20">
            {!postData.noindex && <GoogleAdSense pId="3166603343095810" />}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-4 gap-12">

                {/* Main Content */}
                <article className="xl:col-span-3 max-w-3xl mx-auto w-full">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                    <nav aria-label="이동 경로" className="mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-400">홈</Link>
                        <span aria-hidden="true" className="mx-2">/</span>
                        <Link href="/posts" className="hover:text-blue-400">글</Link>
                    </nav>

                    <header className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{postData.title}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm">
                            <Link href="/about" rel="author" className="font-medium text-slate-300 hover:text-blue-400">
                                JunHyung Kang · AI Engineer
                            </Link>
                            <span aria-hidden="true">·</span>
                            <time dateTime={postData.date}>게시 {postData.date}</time>
                            {postData.updated && postData.updated !== postData.date && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <time dateTime={postData.updated}>수정 {postData.updated}</time>
                                </>
                            )}
                            {postData.readingTime && (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>약 {postData.readingTime}분</span>
                                </>
                            )}
                        </div>
                        {postTopics.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2" aria-label="관련 주제">
                                {postTopics.map((topic) => (
                                    <Link
                                        key={topic.slug}
                                        href={`/topics/${topic.slug}`}
                                        className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-blue-300 hover:border-blue-500/60 hover:text-blue-200"
                                    >
                                        {topic.name}
                                    </Link>
                                ))}
                            </div>
                        )}
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

                    <ShareButtons title={postData.title} slug={postData.slug} />

                    <RelatedPosts posts={relatedPosts} />

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
