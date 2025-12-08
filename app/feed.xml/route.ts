import RSS from 'rss';
import { getSortedPostsData } from '@/lib/posts';

export const dynamic = 'force-static';

export async function GET() {
    const allPosts = getSortedPostsData();
    const site_url = 'https://junhyungkang.github.io';

    const feed = new RSS({
        title: "JunHyung's Tech Log",
        description: "Portfolio and Blog of JH Kang, an AI Engineer specializing in LLMs, Computer Vision, and Modern Web Development.",
        site_url: site_url,
        feed_url: `${site_url}/feed.xml`,
        language: 'ko',
        pubDate: new Date(),
        copyright: `Agll rights reserved ${new Date().getFullYear()}, JunHyung Kang`,
    });

    allPosts.forEach((post) => {
        feed.item({
            title: post.title,
            description: post.teaser || post.contentHtml?.slice(0, 150) + '...' || '',
            url: `${site_url}/posts/${post.slug}`,
            date: post.date,
            author: 'JunHyung Kang',
        });
    });

    return new Response(feed.xml({ indent: true }), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
