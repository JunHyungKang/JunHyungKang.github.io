'use client';

import Giscus from '@giscus/react';

export default function Comments() {
    return (
        <section className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
            <Giscus
                id="comments"
                repo="JunHyungKang/JunHyungKang.github.io"
                repoId="MDEwOlJlcG9zaXRvcnkyMjc0OTc1NTY="
                category="General"
                categoryId="DIC_kwDODY9WVM4CzePW"
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="bottom"
                theme="preferred_color_scheme"
                lang="ko"
                loading="lazy"
            />
        </section>
    );
}
