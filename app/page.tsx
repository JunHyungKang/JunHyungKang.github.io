import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import Navbar from '@/components/Navbar';
import ArticleCard from '@/components/ArticleCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const allPostsData = getSortedPostsData();
  const featuredPost = allPostsData[0];
  const recentPosts = allPostsData.slice(1, 7); // Next 6 posts (2 rows of 3)

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Navbar />

      {/* Featured Post Hero */}
      <section className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-blue-400 font-medium tracking-wider text-sm uppercase">Featured Article</span>
        </div>

        {featuredPost ? (
          <Link href={`/posts/${featuredPost.slug}`} className="group block">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-blue-400 transition-colors">
                  {featuredPost.title}
                </h1>
                <p className="text-xl text-slate-400 mb-8 leading-relaxed line-clamp-3">
                  {featuredPost.teaser || "Read the latest insights and tutorials on AI, Engineering, and Tech."}
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                  Read Article <ArrowRight size={20} />
                </div>
              </div>

              <div className="order-1 md:order-2 relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl group-hover:shadow-blue-900/20 transition-all">
                {featuredPost.image ? (
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono">
                      {featuredPost.date}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-center py-20 text-slate-500">No posts found.</div>
        )}
      </section>

      {/* Recent Articles Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold text-white">Recent Articles</h2>
          <Link href="/posts" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
            View Archive <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map(({ slug, date, title, teaser, image }) => (
            <ArticleCard
              key={slug}
              title={title}
              excerpt={teaser || "No description available."}
              date={date}
              slug={slug}
              image={image}
            />
          ))}
        </div>
      </section>

      {/* Secondary Projects Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Selected Projects</h2>
              <p className="text-slate-400 text-sm">Check out what I've been building.</p>
            </div>
            <Link href="/projects" className="text-slate-400 hover:text-white text-sm font-medium">
              View all projects →
            </Link>
          </div>

          <Link href="/projects" className="group block p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">View Project Portfolio</h3>
                <p className="text-slate-400">Visit free-utils.app to see all my deployed projects and tools.</p>
              </div>
              <ArrowRight className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={24} />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} JH Kang. Built with Next.js & Tailwind.
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/JunHyungKang" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/junhyung-kang-071605106/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
