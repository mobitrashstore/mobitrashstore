
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import * as api from '../services/api';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

const HomeBlogSection: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const blogPosts = await api.getBlogPosts();
                setPosts(blogPosts.slice(0, 6)); // Get up to 6 for marquee
            } catch (error) {
                console.error("Failed to fetch blog posts for home", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (!loading && posts.length === 0) return null;

    // Double the posts for infinite marquee effect
    const marqueePosts = [...posts, ...posts];

    return (
        <section className="pt-12 pb-4 md:py-20 overflow-hidden">
            <div className="px-4 md:px-6">
                <div className="flex flex-row items-end justify-between mb-8 md:mb-10">
                    <div>
                        <p className="text-emerald-600 font-bold uppercase tracking-wider text-xs mb-2">
                            Latest Updates
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                            From the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">Blog</span>
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        <span className="hidden md:block">View All Articles</span>
                        <div className="w-10 h-10 md:w-auto md:h-auto rounded-full bg-emerald-50 md:bg-transparent flex items-center justify-center text-emerald-600 active:scale-90 transition-transform">
                            <ArrowRightIcon className="w-6 h-6 md:w-4 md:h-4" />
                        </div>
                    </button>
                </div>
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                {posts.slice(0, 3).map((post) => (
                    <div
                        key={post.slug}
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                        {/* Fixed-height image container that always fills correctly */}
                        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' /* 16:9 ratio */ }}>
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-800">
                                {post.category || 'Tech'}
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                <span>{post.date}</span>
                                {post.readingTime && (
                                    <>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span>{post.readingTime}</span>
                                    </>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                {post.excerpt}
                            </p>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600">Read More</span>
                                <ArrowRightIcon className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Auto-Scrolling Slider (Marquee) */}
            <div className="md:hidden w-full relative">
                <div className="flex animate-marquee gap-4 w-max px-4">
                    {marqueePosts.map((post, idx) => (
                        <div
                            key={`${post.slug}-${idx}`}
                            onClick={() => navigate(`/blog/${post.slug}`)}
                            className="w-[280px] bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col flex-shrink-0"
                        >
                            {/* Fixed aspect-ratio image container for mobile cards too */}
                            <div className="relative w-full overflow-hidden" style={{ paddingTop: '60%' }}>
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-800">
                                    {post.category || 'Tech'}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                                    <span>{post.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-tight line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-emerald-600">Read Article</span>
                                    <ArrowRightIcon className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </section>
    );
}

export default HomeBlogSection;
