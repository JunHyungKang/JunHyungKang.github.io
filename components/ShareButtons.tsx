"use client";

import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const url = `https://junhyungkang.github.io/posts/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-3 my-8 py-6 border-y border-slate-800">
      <span className="text-slate-400 text-sm font-medium mr-2">Share this post:</span>
      
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-[#0A66C2] hover:text-white transition-all duration-300"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>

      <button
        onClick={handleCopy}
        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-300 relative"
        aria-label="Copy Link"
      >
        {copied ? <Check size={18} className="text-green-400" /> : <Link2 size={18} />}
      </button>
      
      {copied && <span className="text-xs text-green-400 animate-fade-in">Copied!</span>}
    </div>
  );
}
