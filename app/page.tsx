import { getSortedPostsData } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import ArticleCard from '@/components/ArticleCard';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const recentPosts = allPostsData.slice(0, 4); // Show only recent 4 posts

  const featuredProjects = [
    {
      title: "LLM Chatbot",
      description: "A specialized LLM chatbot that understands context and provides accurate responses using RAG.",
      tags: ["Python", "PyTorch", "Transformers"],
      image: "/projects/chatbot.png",
      href: "/projects/llm-chatbot"
    },
    {
      title: "Computer Vision API",
      description: "Real-time object detection and classification API built for high-throughput video streams.",
      tags: ["OpenCV", "FastAPI", "Docker"],
      image: "/projects/vision.png",
      href: "/projects/cv-api"
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Navbar />

      <Hero />

      {/* Featured Work Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Work</h2>
            <p className="text-slate-400">Selected projects and experiments.</p>
          </div>
          <a href="/projects" className="text-blue-400 hover:text-blue-300 text-sm font-medium hidden md:block">
            View all projects →
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Latest Articles</h2>
            <p className="text-slate-400">Thoughts on AI, Engineering, and Tech.</p>
          </div>
          <a href="/posts" className="text-blue-400 hover:text-blue-300 text-sm font-medium hidden md:block">
            View all articles →
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPosts.map(({ slug, date, title, teaser }) => (
            <ArticleCard
              key={slug}
              title={title}
              excerpt={teaser || "No description available."}
              date={date}
              slug={slug}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} JH Kang. Built with Next.js & Tailwind.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
