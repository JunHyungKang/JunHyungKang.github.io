"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 text-sm font-medium mb-6">
                        AI Engineer & Full Stack Developer
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Turning Data into <br />
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Intelligence.
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                        Specializing in building intelligent applications with Large Language Models,
                        Reinforcement Learning, and modern web technologies.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/projects"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25"
                        >
                            View Projects <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/resume.pdf"
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 border border-slate-700"
                        >
                            Download Resume <Download size={20} />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative hidden md:block"
                >
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl flex items-center justify-center group">
                        {/* Placeholder for 3D element or Image */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
                        <div className="relative z-10 text-center p-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700">
                            <code className="text-blue-400 text-sm block mb-2">@AI_Engineer</code>
                            <div className="text-2xl font-bold text-white">Building the Future</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
