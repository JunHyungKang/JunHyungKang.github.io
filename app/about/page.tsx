import Navbar from "@/components/Navbar";
import { Download, Mail, Github, Linkedin } from "lucide-react";

export default function About() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <div className="mb-12 border-b border-slate-800 pb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Me</h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        Hello! I'm JH Kang, an AI Engineer based in South Korea.
                        I'm passionate about machine learning, software engineering, and sharing my knowledge through this blog.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                Experience
                            </h2>
                            <div className="space-y-8">
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">AI Engineer</h3>
                                    <p className="text-blue-400 mb-2">Company X • 202X - Present</p>
                                    <p className="text-slate-400">
                                        Working on large language models and computer vision projects.
                                        Leading the development of RAG-based internal tools.
                                    </p>
                                </div>
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">Software Developer</h3>
                                    <p className="text-blue-400 mb-2">Company Y • 201X - 202X</p>
                                    <p className="text-slate-400">
                                        Developed web applications and backend services using React and Node.js.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Contact</h2>
                            <p className="text-slate-400 mb-6">
                                Feel free to reach out to me via email or social media.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="mailto:gogo0920007@gmail.com" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-200">
                                    <Mail size={18} /> Email Me
                                </a>
                                <a href="https://github.com/JunHyungKang" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-200">
                                    <Github size={18} /> GitHub
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-200">
                                    <Linkedin size={18} /> LinkedIn
                                </a>
                            </div>
                        </section>
                    </div>

                    <div className="md:col-span-1">
                        <div className="sticky top-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Resume</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Download my full resume to see detailed project history and skills.
                            </p>
                            <a
                                href="/resume.pdf"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                            >
                                <Download size={18} /> Download CV
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
