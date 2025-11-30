"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

interface ArticleCardProps {
    title: string;
    excerpt: string;
    date: string;
    slug: string;
    readTime?: string;
    image?: string;
}

export default function ArticleCard({ title, excerpt, date, slug, readTime = "5 min read", image }: ArticleCardProps) {
    return (
        <Link href={`/posts/${slug}`} className="group block h-full">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 h-full flex flex-col">
                {image && (
                    <div className="aspect-video w-full overflow-hidden bg-slate-800">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {date}
                        </span>
                        <span>•</span>
                        <span>{readTime}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>

                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {excerpt}
                    </p>

                    <div className="text-blue-400 text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform inline-flex items-center">
                        Read more →
                    </div>
                </div>
            </div>
        </Link>
    );
}
