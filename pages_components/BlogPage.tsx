
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { BlogPost } from '../types';
import SEO from '../components/SEO';
import MobileSkyHeader from '../components/MobileSkyHeader';

export interface BlogPageProps {
  navigate: (path: string) => void;
}

const BlogCard: React.FC<{ post: BlogPost; navigate: (path: string) => void }> = React.memo(
  ({ post, navigate }) => {
    const postPath = api.getBlogPermalink(post);

    const handlePostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      navigate(postPath);
    };

    return (
      <a
        href={postPath}
        onClick={handlePostClick}
        className="group block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
              {post.category}
            </div>
          )}
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            <span>{post.date}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span>{post.readingTime || '5 min read'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight mb-4">
            {post.title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                {post.author.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700">{post.author}</span>
            </div>
            <span className="text-sm font-black text-amber-600 group-hover:translate-x-1 transition-transform">
              Read Article →
            </span>
          </div>
        </div>
      </a>
    );
  }
);

const BlogPage: React.FC<BlogPageProps> = ({ navigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const blogPosts = await api.getBlogPosts();
      setPosts(blogPosts);
      setLoading(false);

      const tagSet = new Set<string>();
      blogPosts.forEach(p => {
        const tags = (p as any).tags as string[] | undefined;
        tags?.forEach(t => tagSet.add(t));
      });
      setAllTags(Array.from(tagSet));
    };
    fetchPosts();
  }, []);

  const visiblePosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter(p => {
      const tags = (p as any).tags as string[] | undefined;
      return tags?.includes(activeTag);
    });
  }, [posts, activeTag]);

  return (
    <div className="md:py-16 bg-white min-h-screen">
      <MobileSkyHeader
        title="Journal"
        onBack={() => navigate('/')}
        showNotification={true}
        navigate={navigate}
      />
      {/* Full Width Container */}
      <div className="w-full px-6 sm:px-10 lg:px-16 pt-8 md:pt-0">

        {/* Header */}
        <SEO
          title="Mobi Store Journal - Tech News & Guides in Nepal"
          description="Expert insights, local news, and guides on keeping your tech lifecycle sustainable and profitable in the heart of the Himalayas. Read the latest from Mobi Store."
          keywords="tech news nepal, mobile repair guides, sell phone tips, mobi trash blog"
          canonicalUrl="https://mobitrashstore.com/blog"
        />
        <div className="mb-12">
          <p className="text-xs font-black tracking-[0.3em] uppercase text-amber-500 mb-2">
            Mobi Store Journal
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 italic">Nepal's Tech Economy.</span>
          </h1>
          <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
              Expert insights, local news, and guides on keeping your tech lifecycle sustainable and profitable in the heart of the Himalayas.
            </p>

          </div>
        </div>

        {/* Grid - Full width of the container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-100 animate-pulse overflow-hidden h-[500px]"
              >
                <div className="h-64 w-full bg-slate-100" />
                <div className="p-8 space-y-4">
                  <div className="h-4 w-1/3 bg-slate-100 rounded" />
                  <div className="h-8 w-3/4 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : visiblePosts.length > 0 ? (
            visiblePosts.map((post, idx) => (
              <BlogCard key={post.id || idx} post={post} navigate={navigate} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl font-bold text-slate-300 italic">No articles found in this archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
