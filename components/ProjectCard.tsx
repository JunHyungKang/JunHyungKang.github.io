"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
    title: string;
    description: string;
    tags: string[];
    image: string;
    href: string;
}

export default function ProjectCard({ title, description, tags, image, href }: ProjectCardProps) {
    return (
        <Link href={href} className="group block">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Placeholder loading state */}
                    {/* In a real app, use next/image with a real src. For now, we'll use a colored div if no image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={20} className="text-white" />
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                        {description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
}
