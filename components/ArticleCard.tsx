"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

interface ArticleCardProps {
    title: string;
    excerpt: string;
    date: string;
    slug: string;
    readTime?: string;
}

export default function ArticleCard({ title, excerpt, date, slug, readTime = "5 min read" }: ArticleCardProps) {
    return (
        <Link href={`/posts/${slug}`} className="group block">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300">
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

                <p className="text-slate-400 text-sm line-clamp-2">
                    {excerpt}
                </p>
            </div>
        </Link>
    );
}
