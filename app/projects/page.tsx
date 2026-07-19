import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Github, Wrench } from 'lucide-react';

export const metadata: Metadata = {
    title: 'AI 엔지니어링 프로젝트',
    description: 'AI 엔지니어 강준형이 직접 만들고 운영한 공개 도구, 오픈소스 작업과 기술 프로젝트를 소개합니다.',
};

const projects = [
    {
        title: 'Free Utils',
        description: 'A collection of small web utilities built to make common browser-based tasks quick and accessible without installing an app.',
        href: 'https://www.free-utils.app/',
        cta: 'Open Free Utils',
        icon: Wrench,
        tags: ['Web tools', 'Product engineering', 'Public service'],
    },
    {
        title: 'Open-source work',
        description: 'Public code, experiments, and contributions related to AI engineering, developer tooling, and practical software development.',
        href: 'https://github.com/JunHyungKang',
        cta: 'View GitHub profile',
        icon: Github,
        tags: ['AI engineering', 'Open source', 'Experiments'],
    },
    {
        title: 'AI engineering field notes',
        description: 'Long-form articles that connect papers and tools with implementation experience, trade-offs, failures, and lessons learned.',
        href: '/posts',
        cta: 'Read the articles',
        icon: BookOpen,
        tags: ['LLM agents', 'Deep learning', 'Engineering practice'],
    },
];

export default function Projects() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="max-w-3xl mb-14">
                    <p className="text-blue-400 font-medium tracking-wider text-sm uppercase mb-4">Selected work</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Projects and public work</h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        I build practical tools and document what I learn while working on AI systems. This page collects public work that can be explored without an account.
                    </p>
                </header>

                <section className="grid gap-6" aria-label="Selected projects">
                    {projects.map(({ title, description, href, cta, icon: Icon, tags }) => {
                        const external = href.startsWith('http');
                        return (
                            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 md:p-9">
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                        <Icon className="text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
                                        <p className="text-slate-400 leading-relaxed mb-5">{description}</p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {tags.map((tag) => (
                                                <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            href={href}
                                            target={external ? '_blank' : undefined}
                                            rel={external ? 'noopener noreferrer' : undefined}
                                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            {cta} <ArrowUpRight size={17} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </div>
        </main>
    );
}
