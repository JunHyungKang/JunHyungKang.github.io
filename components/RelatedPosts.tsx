"use client";

import Link from "next/link";
import { PostData } from "@/lib/posts";
import { ArrowRight } from "lucide-react";

interface RelatedPostsProps {
  posts: PostData[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 mb-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        You might also like
        <ArrowRight className="w-5 h-5 text-slate-500" />
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/posts/${post.slug}`}
            className="group block bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300"
          >
            <div className="p-5 h-full flex flex-col">
                <div className="text-xs text-slate-500 mb-2">{post.date}</div>
                <h4 className="text-lg font-bold text-slate-200 group-hover:text-blue-400 mb-2 line-clamp-2 transition-colors">
                    {post.title}
                </h4>
                {post.teaser && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
                        {post.teaser}
                    </p>
                )}
                <div className="mt-auto flex gap-2 flex-wrap">
                    {post.tags && post.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
