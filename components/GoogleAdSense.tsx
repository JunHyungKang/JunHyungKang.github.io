"use client";

import Script from 'next/script';
import { usePathname } from 'next/navigation';

type Props = {
    pId: string;
};

const excludedPostPaths = new Set([
    '/posts/2022-07-01-pip_trusted_host',
    '/posts/2022-08-16-RL_basic',
    '/posts/2022-10-27-matplotlib',
    '/posts/2022-11-01-creative_problem_solving',
]);

export default function GoogleAdSense({ pId }: Props) {
    const pathname = usePathname();
    const isContentPage = pathname === '/' || pathname === '/posts' || pathname.startsWith('/posts/');

    if (!isContentPage || excludedPostPaths.has(pathname)) {
        return null;
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
