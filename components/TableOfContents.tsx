"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Actually, looking at user's code, they use Tailwind classes directly. I'll stick to that.

interface TableOfContentsProps {
  headings: { id: string; text: string; level: number }[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" } // Trigger when element is near top
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto pl-4 border-l border-slate-800">
      <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
        On This Page
      </h4>
      <nav className="flex flex-col space-y-3">
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(`#${heading.id}`)?.scrollIntoView({
                behavior: "smooth",
              });
              // Manually set active mostly for immediate feedback
              setActiveId(heading.id);
            }}
            className={`text-sm transition-colors duration-200 border-l-2 pl-4 -ml-[1.05rem] ${
              activeId === heading.id
                ? "text-blue-400 border-blue-500 font-medium"
                : "text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-700"
            } ${heading.level === 3 ? "ml-4" : ""}`}
          >
            {heading.text}
          </Link>
        ))}
      </nav>
    </div>
  );
}
