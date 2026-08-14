import React, { useState, useEffect } from 'react';
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
        className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200/90 hover:border-emerald-500/50"
      >
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-emerald-800 border border-emerald-200 shadow-sm">
              {post.category}
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
              <span>{post.date}</span>
              <span>&middot;</span>
              <span>{post.readingTime || '5 min read'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug mb-2">
              {post.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                {post.author ? post.author.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="text-xs font-medium text-slate-700">{post.author}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Read Article &rarr;
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const blogPosts = await api.getBlogPosts();
      setPosts(blogPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="py-6 md:py-10 bg-slate-50 min-h-screen">
      <MobileSkyHeader
        title="Blog"
        onBack={() => navigate('/')}
        showNotification={true}
        navigate={navigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SEO
          title="Mobi Store Blog - Tech News, Guides & Phone Insights"
          description="Read helpful smartphone guides, repair tips, device comparisons, and technology news from the Mobi Store team."
          keywords="tech news nepal, mobile repair guides, sell phone tips, mobi store blog"
          canonicalUrl="https://mobitrashstore.com/blog"
        />

        {/* Human-Made Clean Header */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-wider uppercase text-emerald-600 mb-1.5">
            Mobi Store Blog
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Latest Tech News & Buying Guides
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mt-2">
            Practical device advice, repair breakdowns, and honest comparisons from our workshop.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 animate-pulse overflow-hidden h-[340px]"
              >
                <div className="h-44 w-full bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, idx) => (
              <BlogCard key={post.id || idx} post={post} navigate={navigate} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-base font-medium text-slate-500">No articles found in this archive.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
