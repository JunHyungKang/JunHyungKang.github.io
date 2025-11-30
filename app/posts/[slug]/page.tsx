import { getAllPostIds, getPostData } from '@/lib/posts';
import Head from 'next/head';

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => path.params);
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    return (
        <article className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{postData.title}</h1>
            <div className="text-gray-500 dark:text-gray-400 mb-8">{postData.date}</div>
            <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
            />
        </article>
    );
}
