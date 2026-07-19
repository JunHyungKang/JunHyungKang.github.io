import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 border-t border-slate-800 bg-[#020617]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} JH Kang. AI 엔지니어링 기록.
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <Link href="/about" className="text-slate-400 hover:text-white transition-colors">소개</Link>
                    <Link href="/topics" className="text-slate-400 hover:text-white transition-colors">주제</Link>
                    <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">개인정보처리방침</Link>
                    <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors">이용약관</Link>
                    <a href="https://github.com/JunHyungKang" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
                    <a href="https://www.linkedin.com/in/junhyung-kang-071605106/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}
