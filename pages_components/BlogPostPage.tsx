
import React, { useEffect, useState, useMemo } from 'react';
import * as api from '../services/api';
import { BlogPost } from '../types';
import NotFoundPage from './NotFoundPage';
import Spinner from '../components/Spinner';
import { EyeIcon } from '../components/icons/EyeIcon';
import { MagnifyingGlassIcon } from '../components/icons/MagnifyingGlassIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import SEO from '../components/SEO';
import MobileSkyHeader from '../components/MobileSkyHeader';
import VisualEditWrapper from '../components/VisualEditWrapper';
import { useVisualEditing } from '../context/VisualEditingContext';
import EditableText from '../components/EditableText';
import InArticleAd from '../components/InArticleAd';


export interface BlogPostPageProps {
  slug: string;
  navigate: (path: string) => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, navigate }) => {
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [viewCount, setViewCount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // local comments state
  const [comments, setComments] = useState<
    { id: number; name: string; message: string; createdAt: string }[]
  >([]);
  const [commentName, setCommentName] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  // Newsletter state for sidebar
  const [sidebarEmail, setSidebarEmail] = useState('');
  const [sidebarSubscribed, setSidebarSubscribed] = useState(false);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      setPost(undefined);
      try {
        const [foundPost, postsList, count] = await Promise.all([
          api.getBlogPostBySlug(slug),
          api.getBlogPosts(),
          api.incrementBlogViewAndGetCount(slug)
        ]);

        if (!foundPost) {
          setPost(null);
          return;
        }

        setPost(foundPost);
        setAllPosts(postsList);
        setViewCount(count);
      } catch (e) {
        console.error('Failed to load blog post', e);
        setPost(null);
      }
    };

    fetchPostAndRelated();
  }, [slug]);

  // LIVE VIEW COUNT POLLING
  useEffect(() => {
    if (!post) return;

    const interval = setInterval(async () => {
      try {
        const lifetimeViews = await api.getBlogStats(slug);
        setViewCount(lifetimeViews);
      } catch (e) {
        console.warn('Blog view polling failed', e);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [post, slug]);

  // DARAZ-STYLE URL AUTO-CORRECTION
  useEffect(() => {
    if (!post) return;

    // Use the API helper to get the "correct" Daraz-style permalink
    const permalink = api.getBlogPermalink(post);
    const currentPath = window.location.pathname;

    // If current path doesn't match the new standard (slug-bpID),
    // silently update the URL to the SEO-standard one.
    if (currentPath !== permalink) {
      window.history.replaceState(null, '', permalink);
    }
  }, [post]);

  const handleBackToBlog = () => {
    navigate('/blog');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSidebarSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarEmail.trim()) return;
    setSidebarSubscribed(true);
    setTimeout(() => {
      setSidebarSubscribed(false);
      setSidebarEmail('');
    }, 4000);
  };

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const currentTags = ((post as any).tags || []) as string[];
    return allPosts
      .filter((p) => p.slug !== slug)
      .filter((p) => {
        const tags = ((p as any).tags || []) as string[];
        return tags.some((t) => currentTags.includes(t));
      })
      .slice(0, 5);
  }, [allPosts, post, slug]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentMessage.trim()) return;

    setComments((prev) => [
      {
        id: Date.now(),
        name: commentName.trim(),
        message: commentMessage.trim(),
        createdAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setCommentName('');
    setCommentMessage('');
  };

  if (post === undefined) {
    return (
      <div className="text-center py-20 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return <NotFoundPage navigate={navigate} />;
  }

  const anyPost = post as any;
  const tags: string[] = (anyPost.tags || []) as string[];
  const readTime: string | undefined = anyPost.readTime || anyPost.readingTime;
  const category: string | undefined = anyPost.category;
  const authorAvatar: string | undefined = anyPost.authorAvatar || (post.author === 'Mobi Store Team' ? 'https://ik.imagekit.io/Btmobilecare/Developers_mobistorestore&pdfbullet?updatedAt=1764870614728' : undefined);
  const authorRole: string | undefined = anyPost.authorRole;

  const siteUrl = 'https://mobitrashstore.com';
  const postUrl = `https://mobitrashstore.com${api.getBlogPermalink(post)}`;
  const keywords = tags.join(', ');

  const articleSchema = {
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.imageUrl],
    "datePublished": post.date,
    "dateModified": post.date,
    "author": [{
      "@type": "Person",
      "name": post.author || "Mobi Store Staff"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Mobi Store",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ik.imagekit.io/Btmobilecare/logo.png"
      }
    },
    "description": post.excerpt
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": postUrl
      }
    ]
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema]
  };

  return (
    <div className="bg-white min-h-screen relative">
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={keywords}
        image={post.imageUrl}
        type="article"
        author={post.author}
        publishedTime={post.date}
        canonicalUrl={postUrl}
        schema={combinedSchema}
      />

      <MobileSkyHeader
        title="Article"
        onBack={() => navigate('/blog')}
        showNotification={true}
        navigate={navigate}
      />
      <VisualEditWrapper
        label="Blog Content"
        config={post}
        onSave={async (newData) => {
          if (!post) return;
          await api.updateBlogPost(post.id, newData);
          setPost({ ...post, ...newData });
        }}
      >
        {/* 1. FULL WIDTH WHITE HERO HEADER */}
        <section className="bg-white text-slate-900 w-full border-b border-slate-100 relative z-10 md:pt-0">
          <div className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
            <button
              onClick={handleBackToBlog}
              className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-orange-600 mb-6 uppercase tracking-[0.2em] transition-colors"
            >
              ← BACK TO ARCHIVE
            </button>

            {category && (
              <p className="text-[10px] tracking-[0.4em] uppercase text-orange-600 font-black mb-3">
                {category}
              </p>
            )}

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-slate-900 w-full max-w-4xl">
              <EditableText
                value={post.title}
                onSave={async (val) => {
                  if (!post) return;
                  const newData = { title: val };
                  await api.updateBlogPost(post.id, newData);
                  setPost({ ...post, ...newData });
                }}
                tag="span"
              />
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-500 font-bold">
              <div className="flex items-center gap-3">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={post.author}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black border border-slate-200 text-slate-400">
                    {post.author.charAt(0)}
                  </div>
                )}
                <span className="text-slate-900">
                  <EditableText
                    value={post.author}
                    onSave={async (val) => {
                      if (!post) return;
                      const newData = { author: val };
                      await api.updateBlogPost(post.id, newData);
                      setPost({ ...post, ...newData });
                    }}
                    tag="span"
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-slate-300" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{readTime || '3 min read'}</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <EyeIcon className="w-4 h-4" />
                <span className="font-black">{viewCount.toLocaleString()} Reads</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FULL WIDTH CONTENT GRID */}
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* MAIN COLUMN (9/12 for extra width) */}
            <main className="lg:col-span-9 space-y-10">
              {/* Feature Image - Optimized Fit (No cropping) */}
              <div className="rounded-xl overflow-hidden bg-slate-100/50 border border-slate-200 shadow-sm w-full min-h-[300px] flex items-center justify-center">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-[600px] object-contain block mx-auto"
                />
              </div>

              {/* Top Article Ad */}
              <InArticleAd />


              {/* Article Content */}
              <div className="w-full max-w-4xl">
                <EditableText
                  value={post.content}
                  onSave={async (val) => {
                    if (!post) return;
                    const newData = { content: val };
                    await api.updateBlogPost(post.id, newData);
                    setPost({ ...post, ...newData });
                  }}
                  tag="article"
                  className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-blue-600 text-sm md:text-base prose-table:w-full prose-table:text-sm prose-td:p-3 prose-td:border prose-td:border-slate-200"
                  htmlMode={true}
                  multiline={true}
                />

                {/* Bottom Article Ad */}
                <InArticleAd />

                {/* Author Card Footer */}
                <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-slate-300 flex-shrink-0">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={post.author} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">{post.author.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      <EditableText
                        value={post.author}
                        onSave={async (val) => {
                          if (!post) return;
                          const newData = { author: val };
                          await api.updateBlogPost(post.id, newData);
                          setPost({ ...post, ...newData });
                        }}
                        tag="span"
                      />
                    </h4>
                    {authorRole && <p className="text-xs text-slate-500">{authorRole}</p>}
                  </div>
                </div>

                {/* Discussion Section */}
                <section className="mt-16 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-xl font-bold text-slate-900">Comments</h3>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{comments.length}</span>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                    <textarea
                      placeholder="Join the discussion..."
                      value={commentMessage}
                      onChange={(e) => setCommentMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                      Post Comment
                    </button>
                  </form>

                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-slate-900">{c.name}</span>
                          <span className="text-xs text-slate-400">{c.createdAt}</span>
                        </div>
                        <p className="text-sm text-slate-600">{c.message}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </main>

            {/* SIDEBAR COLUMN (3/12) */}
            <aside className="lg:col-span-3 space-y-10">
              {/* Search Module */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Search</h3>
                <form onSubmit={handleSearch} className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </form>
              </div>

              {/* Related Content Module */}
              {relatedPosts.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedPosts.map(rp => (
                      <button
                        key={rp.slug}
                        onClick={() => navigate(`/blog/${rp.slug}`)}
                        className="w-full group text-left flex gap-3 items-center"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          <img src={rp.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600">
                            {rp.title}
                          </h4>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Cloud Module - Removed as requested by user for better aesthetics */}


              {/* Newsletter Side Module */}
              <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2">Newsletter</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Stay updated with tech in Nepal.
                </p>
                <form onSubmit={handleSidebarSubscribe} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={sidebarEmail}
                    onChange={(e) => setSidebarEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${sidebarSubscribed ? 'bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {sidebarSubscribed ? 'Subscribed!' : 'Join Now'}
                  </button>
                </form>
              </div>
            </aside>

          </div>
        </div>
      </VisualEditWrapper>

      {/* Footer Exit */}
      <div className="pb-24 pt-12 text-center relative z-10">
        <button
          onClick={handleBackToBlog}
          className="group flex flex-col items-center gap-4 mx-auto"
        >
          <div className="h-px w-20 bg-slate-200 group-hover:w-40 group-hover:bg-orange-500 transition-all duration-700"></div>
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.8em] group-hover:text-orange-600 transition-colors">
            END OF ENTRY
          </span>
        </button>
      </div>
    </div>
  );
};

export default BlogPostPage;
