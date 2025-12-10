"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, ArrowRight } from "lucide-react";
import { PostData } from "@/lib/posts";

import { Dispatch, SetStateAction } from "react";

interface CommandMenuProps {
  posts: PostData[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CommandMenu({ posts, isOpen, setIsOpen }: CommandMenuProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setIsOpen]);

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
        <Command label="Global Search" className="w-full">
          <div className="flex items-center border-b border-slate-700 px-4">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Command.Input 
              placeholder="Search articles..." 
              className="w-full h-14 bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none text-lg"
            />
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</span>
            </div>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
            <Command.Empty className="py-6 text-center text-slate-500 text-sm">
              No results found.
            </Command.Empty>

            {posts.length > 0 && (
              <Command.Group heading="Posts" className="text-xs font-medium text-slate-500 px-2 py-1.5 uppercase tracking-wider">
                {posts.map((post) => (
                  <Command.Item
                    key={post.slug}
                    value={`${post.title} ${post.tags?.join(" ")} ${post.teaser}`}
                    onSelect={() => runCommand(() => router.push(`/posts/${post.slug}`))}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-300 aria-selected:bg-blue-600 aria-selected:text-white cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 min-w-[1rem] text-slate-500 group-aria-selected:text-blue-200" />
                      <div className="flex flex-col truncate">
                        <span className="font-medium truncate">{post.title}</span>
                        <span className="text-xs text-slate-500 group-aria-selected:text-blue-200 truncate">{post.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Navigation" className="text-xs font-medium text-slate-500 px-2 py-1.5 uppercase tracking-wider mt-2">
              <Command.Item
                value="Home Page"
                onSelect={() => runCommand(() => router.push("/"))}
                className="flex items-center px-3 py-2.5 rounded-lg text-slate-300 aria-selected:bg-slate-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                Go to Home
              </Command.Item>
              <Command.Item
                value="About Me"
                onSelect={() => runCommand(() => router.push("/about"))}
                className="flex items-center px-3 py-2.5 rounded-lg text-slate-300 aria-selected:bg-slate-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                About Me
              </Command.Item>
              <Command.Item
                value="Projects"
                onSelect={() => runCommand(() => router.push("/projects"))}
                className="flex items-center px-3 py-2.5 rounded-lg text-slate-300 aria-selected:bg-slate-800 aria-selected:text-white cursor-pointer transition-colors"
              >
                Projects
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t border-slate-700 px-4 py-2.5 bg-slate-900/50 flex items-center justify-between">
             <div className="text-xs text-slate-500">
                <span className="font-medium text-slate-400">Pro tip:</span> Search by keywords or tags
             </div>
             <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                   Use <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↑</kbd> <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                   <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↵</kbd> to select
                </span>
             </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
