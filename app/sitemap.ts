import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const allPosts = getSortedPostsData();
    const baseUrl = 'https://junhyungkang.github.io';

    const posts = allPosts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: post.date,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const routes = ['', '/about', '/posts', '/projects'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes, ...posts];
}
