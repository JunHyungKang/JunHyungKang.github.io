import { Download, Mail, Github, Linkedin, BookOpen, Award, Code2, GraduationCap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'About Me',
    description: 'Generative AI Engineer specializing in LLMs and MLOps. Professional experience in AI model development and serving.',
};

export default function About() {
    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">

            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-slate-800 pb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Me</h1>
                    <p className="text-xl text-slate-400 leading-relaxed mb-6">
                        I am <strong className="text-white">JH Kang</strong>, a Generative AI Engineer who enjoys working happily.
                    </p>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        After obtaining a Master's degree from the Graduate School of Artificial Intelligence, I have been conducting research and development in AI models.
                        Since the release of ChatGPT, I have focused on becoming a Generative AI specialist, concentrating on developing services utilizing LLMs.
                        I enjoy growing together with colleagues and strive to apply the latest research trends to practical products.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-16">

                        {/* Work Experience */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                                <Code2 className="text-blue-500" /> Work Experience
                            </h2>
                            <div className="space-y-12">
                                {/* SK AX */}
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">Generative AI Engineer</h3>
                                    <p className="text-blue-400 mb-2">SK AX (C&C) • 2022.01 - Present</p>

                                    <div className="space-y-6 mt-4">
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">Manufacturing AI Agent Platform (2025.08 - Present)</h4>
                                            <p className="text-slate-400 text-sm">Developing an automated platform for creating and managing AI agents based on manufacturing expert knowledge.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">Tax AI Service (2024.07 - 2025.07)</h4>
                                            <p className="text-slate-400 text-sm">Developed a Multi-Agent based chatbot for tax law analysis, involving large-scale data preprocessing and hierarchical indexing.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">Financial RAG Chatbot (2024.02 - 2024.07)</h4>
                                            <p className="text-slate-400 text-sm">Implemented an Advanced RAG service for the financial domain, applying techniques like CoN, CoVe, and HyDE.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">Text-to-SQL PoC (2024.01 - 2024.02)</h4>
                                            <p className="text-slate-400 text-sm">Developed and served an sLLM for converting natural language to SQL queries for legacy DB access.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">AI Coding with sLLM (2023.04 - 2023.12)</h4>
                                            <p className="text-slate-400 text-sm">Fine-tuned and served a small LLM for IDE integration to assist with coding tasks.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-200 font-medium mb-1">Vision AI Engineer (2022.01 - 2023.05)</h4>
                                            <p className="text-slate-400 text-sm">Developed object detection models for drone/CCTV imagery and industrial applications.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Previous Roles */}
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">System PM</h3>
                                    <p className="text-slate-500 mb-2">Mando • 2018.10 - 2019.07</p>
                                    <p className="text-slate-400 text-sm">Managed system development for vehicle braking systems.</p>
                                </div>
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">Project Manager</h3>
                                    <p className="text-slate-500 mb-2">Emerson Korea • 2016.12 - 2018.10</p>
                                    <p className="text-slate-400 text-sm">Managed EPC projects focusing on instrumentation.</p>
                                </div>
                                <div className="relative pl-8 border-l border-slate-800">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-600 ring-4 ring-[#020617]" />
                                    <h3 className="text-xl font-semibold text-white">Piping Engineer</h3>
                                    <p className="text-slate-500 mb-2">Samsung C&T • 2012.01 - 2016.07</p>
                                    <p className="text-slate-400 text-sm">Designed piping systems for overseas projects (Dispatched to Australia).</p>
                                </div>
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <BookOpen className="text-blue-500" /> Skills & Certificates
                            </h2>
                            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Programming & Frameworks</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Python", "LangChain", "LangGraph", "Transformers", "PyTorch", "TensorFlow", "PEFT"].map((skill) => (
                                            <span key={skill} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Certificates</h3>
                                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                        <li>Azure AI Document Intelligence Solution</li>
                                        <li>Tensorflow Developer Certificate</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Awards & Activities */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Award className="text-blue-500" /> Awards & Activities
                            </h2>
                            <ul className="space-y-4 text-slate-400">
                                <li>
                                    <strong className="text-white">SK Group AI Competition (2025.09)</strong> - 2nd Place (SLM Development)
                                </li>
                                <li>
                                    <strong className="text-white">LangChain Open Source Contributor (2025.08)</strong> - Fixed Azure OpenAI API bug (PR #32649)
                                </li>
                                <li>
                                    <strong className="text-white">SK C&C GenAI Idea Competition (2023.10)</strong> - 3rd Place
                                </li>
                                <li>
                                    <strong className="text-white">AI Grand Challenge (2020)</strong> - 3rd Place (Behavior Recognition Track)
                                </li>
                                <li>
                                    <strong className="text-white">SK Group Expert (DEVOCEAN)</strong> - Active Member (2024.02 - Present)
                                </li>
                                <li>
                                    <strong className="text-white">Internal Instructor & Mentor</strong> - GenAI Engineer Training (2024 - Present)
                                </li>
                            </ul>
                        </section>

                        {/* Education */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <GraduationCap className="text-blue-500" /> Education
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Sungkyunkwan University</h3>
                                    <p className="text-slate-400">M.S. in Artificial Intelligence (2019.08 - 2022.03)</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Sungkyunkwan University</h3>
                                    <p className="text-slate-400">B.S. in Mechanical Engineering (2006.03 - 2012.03)</p>
                                </div>
                            </div>
                        </section>

                        {/* Publications */}
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Publications</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3 border-l-4 border-blue-500 pl-3">First Author</h3>
                                    <ul className="list-disc list-inside space-y-3 text-slate-400 text-sm">
                                        <li>
                                            <span className="text-slate-200">Kang, Junhyung, et al.</span> "A survey of deep learning-based object detection methods and datasets for overhead imagery." <em>IEEE Access</em> 10 (2022).
                                        </li>
                                        <li>
                                            <span className="text-slate-200">Kang, Junhyung, and Simon S. Woo.</span> "DLPNet: Dynamic Loss Parameter Network using Reinforcement Learning..." <em>AIPR</em> (2021).
                                        </li>
                                        <li>
                                            <span className="text-slate-200">Kang, Junhyung, et al.</span> "Sarod: Efficient End-To-End Object Detection On SAR Images..." <em>ICIP</em> (2021).
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3 border-l-4 border-slate-600 pl-3">Co-Author</h3>
                                    <ul className="list-disc list-inside space-y-3 text-slate-400 text-sm">
                                        <li>
                                            <span className="text-slate-200">Kim, Dongwoo, ... Kang, Junhyung, et al.</span> "Deep Learning for Overseeing Indo-Pacific Bottlenose Dolphin Tourism Law Enforcement." <em>CAI Workshop on AI for Environmental Intelligence</em> (2025). <a href="https://openreview.net/forum?id=bnduW0yJrV" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[OpenReview]</a>
                                        </li>
                                        <li>
                                            <span className="text-slate-200">An, Jaeju, et al.</span> "VFP290k: A large-scale benchmark dataset for vision-based fallen person detection." <em>NeurIPS Datasets and Benchmarks Track</em> (2021).
                                        </li>
                                        <li>
                                            <span className="text-slate-200">전소원, 강준형, 황진희, 우사이먼성일.</span> "국내 딥페이크 기술 현황 및 제도적 대응방안 연구" <em>CISC-S</em> (2020).
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3 border-l-4 border-slate-600 pl-3">Thesis</h3>
                                    <ul className="list-disc list-inside space-y-3 text-slate-400 text-sm">
                                        <li>
                                            <span className="text-slate-200">M.S. Thesis.</span> "Time series prediction with dynamic learning by reinforcement learning" (2022).
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            {/* Contact Card */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                                <div className="space-y-4">
                                    <a href="mailto:gogo0920007@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors">
                                        <Mail size={18} /> gogo0920007@gmail.com
                                    </a>
                                    <a href="https://www.linkedin.com/in/junhyung-kang-071605106/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors">
                                        <Linkedin size={18} /> LinkedIn Profile
                                    </a>
                                    <a href="https://github.com/JunHyungKang" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors">
                                        <Github size={18} /> GitHub Profile
                                    </a>
                                    <a href="https://devocean.sk.com/experts/view.do?ID=gogo0920007&page=" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors">
                                        <BookOpen size={18} /> Tech Blog (DevOcean)
                                    </a>
                                </div>
                            </div>

                            {/* Resume Download */}
                            <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Full Resume</h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Download the detailed PDF version of my resume.
                                </p>
                                <a
                                    href="/resume.pdf"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <Download size={18} /> Download PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
