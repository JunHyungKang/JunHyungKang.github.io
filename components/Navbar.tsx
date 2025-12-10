"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin, Mail, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CommandMenu from "./CommandMenu";
import { PostData } from "@/lib/posts";

interface NavbarProps {
  posts?: PostData[];
}

export default function Navbar({ posts = [] }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Projects", href: "/projects" },
        { name: "Blog", href: "/posts" },
    ];

    return (
        <>
            <CommandMenu posts={posts} isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
            
            <nav
                className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled
                    ? "bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        JH Kang
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/50 hover:border-slate-600 group"
                        >
                            <Search size={14} className="group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-medium pr-1">Search...</span>
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">
                                <span>⌘</span>
                                <span>K</span>
                            </div>
                        </button>

                        <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
                            <a href="https://github.com/JunHyungKang" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://www.linkedin.com/in/junhyung-kang-071605106/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:gogo0920007@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-slate-300 hover:text-white p-2"
                        >
                            <Search size={20} />
                        </button>
                        <button
                            className="text-slate-300 hover:text-white"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden"
                        >
                            <div className="px-6 py-8 flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-slate-300 hover:text-white text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
