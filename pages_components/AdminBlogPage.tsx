

import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { BlogPost } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { PencilSquareIcon } from '../components/icons/PencilSquareIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import Spinner from '../components/Spinner';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminBlogPageProps {
    navigate: (path: string) => void;
}

const estimateReadingTime = (html: string): string => {
    // strip HTML and count words
    const text = html.replace(/<[^>]+>/g, ' ');
    const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200)); // ~200 words/min
    return `${minutes} min read`;
};

const BlogModal: React.FC<{
    post: Partial<BlogPost> | null;
    onClose: () => void;
    onSave: (post: Omit<BlogPost, 'id'> | BlogPost) => Promise<void>;
}> = ({ post, onClose, onSave }) => {
    const isEditMode = !!post?.id;

    const [formData, setFormData] = useState({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        imageUrl: post?.imageUrl ?? '',
        author: post?.author ?? 'Admin',
        date: post?.date ?? new Date().toISOString().split('T')[0],
        // NEW: tags as comma-separated input
        tagsInput: post?.tags?.join(', ') ?? '',
        // NEW: reading time, can be blank to auto-generate
        readingTime: post?.readingTime ?? '',
    });

    const [saving, setSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-generate slug from title if empty (create mode only)
    useEffect(() => {
        if (!isEditMode && formData.title && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: formData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, ''),
            }));
        }
    }, [formData.title, formData.slug, isEditMode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const insertText = (tag: string, closeTag: string = '') => {
        const textarea = document.getElementById(
            'content-editor'
        ) as HTMLTextAreaElement | null;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + tag + selection + closeTag + after;
        setFormData(prev => ({ ...prev, content: newText }));

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + tag.length,
                end + tag.length
            );
        }, 0);
    };

    const handleAiGenerate = async () => {
        if (!formData.title) {
            alert("Please enter a Title first so the AI knows what to write about.");
            return;
        }

        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `You are an elite Tech Content Specialist and SEO expert for "Mobi Store" in Nepal. 
            Your goal is to write a MASTER-CLASS, high-authority blog post that will rank #1 on Google and satisfy AdSense "High Value Content" requirements.
            
            Title: "${formData.title}"

            CRITICAL CONTENT REQUIREMENTS:
            1. EPIC LENGTH: Write a minimum of 1500-1800 words. Do not skip details. Be extremely thorough.
            2. STRUCTURE & DEPTH: You MUST include the following 10 SECTIONS:
               - [1] "Hook" Introduction: Captivating narrative about why this topic matters today in Nepal.
               - [2] "At A Glance" Summary: A bulleted list for quick readers.
               - [3] Technical Deep Dive: 400+ words purely on specs, chipsets, and engineering technicalities.
               - [4] "The Nepali Reality": Specific market analysis in Nepal (Authorized vs Grey market, availability in stores like Kirtipur/Kathmandu).
               - [5] User Personas: Identify 3 types of users and explain if they should buy/use this.
               - [6] Ultra-Detailed Comparison: An HTML <table> with at least 8 rows of feature-by-feature comparison.
               - [7] Pro/Con Analysis: Exploding with detail.
               - [8] Sustainability & Re-commerce: How this relates to Mobi Store's mission of reducing e-waste and the 2nd-hand resale value.
               - [9] "Mobi Store Expert Verdict": Final rating out of 10 and a definitive "To Buy or Not to Buy."
               - [10] Comprehensive FAQ: At least 5 detailed questions and answers.

            3. FORMATTING (MUST USE):
               - Headings: Use <h2> for main chapters and <h3> for detailed sub-points.
               - Multimedia: Include 2-3 distinct real images. DO NOT MAKE UP URLS. Use the Unsplash Source API to get actual high-quality photos. Format: <img src="https://source.unsplash.com/800x600/?REAL_TOPIC_KEYWORD" alt="SEO_KEYWORD_DESC" class="w-full h-auto rounded-xl my-8 object-cover shadow-sm bg-slate-50" />. Replace REAL_TOPIC_KEYWORD with specific terms like 'smartphone', 'tech', 'circuit', or the specific brand name.
               - Styling: Use <b> for key terms.
               - Data: Use <ul> for lists and <table> for structured data with class="w-full text-sm text-left my-8 border-collapse shadow-sm rounded-lg overflow-hidden".

            4. LOCAL CONTEXT: Use NPR (Nepalese Rupee) and mention popular local locations.

            OUTPUT JSON:
            - excerpt: 40-50 words click-magnet summary.
            - tagsInput: 8-10 long-tail SEO tags.
            - content: The full HTML content (1500-1800 words) as specified above.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            excerpt: { type: Type.STRING },
                            tagsInput: { type: Type.STRING },
                            content: { type: Type.STRING }
                        },
                        required: ["excerpt", "tagsInput", "content"]
                    }
                }
            });

            if (response.text) {
                const result = JSON.parse(response.text);
                setFormData(prev => ({
                    ...prev,
                    excerpt: result.excerpt || prev.excerpt,
                    tagsInput: result.tagsInput || prev.tagsInput,
                    content: result.content || prev.content
                }));
            }
        } catch (error) {
            console.error("AI Gen Error", error);
            alert("Failed to generate content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const tagsArray =
                formData.tagsInput
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean) ?? [];

            const payload: any = {
                ...(post || {}),
                ...formData,
                tags: tagsArray,
            };

            // remove helper-only field before saving
            delete payload.tagsInput;

            if (!payload.readingTime) {
                payload.readingTime = estimateReadingTime(formData.content);
            }

            await onSave(payload as BlogPost);
            onClose();
        } catch (error) {
            console.error('Save error', error);
            alert('Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    // Lock Body Scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/80 z-[60] flex items-start justify-center pt-20 p-4 animate-fade-in pb-10 overflow-y-auto"
        >
            <div
                className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] mb-10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditMode ? 'Edit Blog Post' : 'Create Blog Post'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Title
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Blog Title"
                                />
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating || !formData.title}
                                    className="px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-bold text-xs flex items-center gap-1 disabled:opacity-50 transition-colors"
                                    title="Auto-fill content based on title"
                                >
                                    {isGenerating ? <Spinner size="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                    {isGenerating ? 'Thinking...' : 'AI Fill'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Slug (URL)
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                disabled={isEditMode}
                                className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-amber-500 bg-slate-50 text-slate-500 disabled:bg-slate-100"
                                placeholder="blog-post-url"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">
                            Cover Image URL
                        </label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">
                            Excerpt (Short Summary)
                        </label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={2}
                            required
                            className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Brief description for the card..."
                        />
                    </div>

                    {/* Tags input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            name="tagsInput"
                            value={formData.tagsInput}
                            onChange={handleChange}
                            className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            placeholder="sell phone, repair, recycle"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            Content (HTML Supported)
                        </label>
                        {/* Simple Toolbar */}
                        <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex-wrap">
                            <button
                                type="button"
                                onClick={() => insertText('<b>', '</b>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                Bold
                            </button>
                            <button
                                type="button"
                                onClick={() => insertText('<i>', '</i>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs italic hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                Italic
                            </button>
                            <button
                                type="button"
                                onClick={() => insertText('<h2>', '</h2>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => insertText('<h3>', '</h3>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                H3
                            </button>
                            <button
                                type="button"
                                onClick={() => insertText('<p>', '</p>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                P
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    insertText('<ul>\n  <li>', '</li>\n</ul>')
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                List
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    insertText('<a href="URL" class="text-blue-600 underline">', '</a>')
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-blue-600 underline shadow-sm"
                            >
                                Link
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    insertText('<img src="URL_HERE" alt="Image" class="w-full h-auto rounded-xl my-4 shadow-sm" />')
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-emerald-600 flex items-center gap-1 shadow-sm"
                                title="Insert Image Tag"
                            >
                                <PhotoIcon className="w-3 h-3" /> Img
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    insertText('<table class="w-full text-sm text-left my-6 border-collapse">\n  <thead>\n    <tr class="bg-slate-50">\n      <th class="p-2 border border-slate-200">Feature</th>\n      <th class="p-2 border border-slate-200">Value</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td class="p-2 border border-slate-200">RAM</td>\n      <td class="p-2 border border-slate-200">8GB</td>\n    </tr>\n  </tbody>\n</table>')
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm"
                                title="Insert Table"
                            >
                                Table
                            </button>
                            <button
                                type="button"
                                onClick={() => insertText('<br/>')}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                                BR
                            </button>
                        </div>
                        <textarea
                            id="content-editor"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={12}
                            required
                            className="w-full p-3 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500 font-mono text-sm leading-relaxed"
                            placeholder="Write your blog content here or use AI..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Author
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Reading Time (optional)
                            </label>
                            <input
                                type="text"
                                name="readingTime"
                                value={formData.readingTime}
                                onChange={handleChange}
                                className="mt-1 w-full p-2.5 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="e.g. 4 min read"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-amber-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-amber-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md active:scale-95"
                        >
                            {saving ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminBlogPage: React.FC<AdminBlogPageProps> = ({ navigate }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(
        null
    );

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await api.getBlogPosts();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSavePost = async (postData: Omit<BlogPost, 'id'> | BlogPost) => {
        try {
            let savedPost: BlogPost;
            if ('id' in postData && postData.id) {
                await api.updateBlogPost(postData.id, postData);
                savedPost = postData as BlogPost;
            } else {
                const newDoc = await api.addBlogPost(postData);
                // Assume id is returned or available
                savedPost = { ...postData, id: postData.slug } as BlogPost;
            }

            // --- DARAZ SECRET: INSTANT INDEXING ---
            const blogPath = api.getBlogPermalink(savedPost);
            await api.pingGoogleIndexing(blogPath);

            await fetchPosts();
        } catch (e) {
            console.error("Blog save failed", e);
        }
    };

    const handleDeletePost = async (slug: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await api.deleteBlogPost(slug);
            await fetchPosts();
        }
    };

    const handleCreateNew = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">
                    Blog Management
                </h1>
                <button
                    onClick={handleCreateNew}
                    className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-md transition-all transform active:scale-95"
                >
                    <PlusCircleIcon className="w-5 h-5" /> Write New Post
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {posts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-bold tracking-wider">
                                                Image
                                            </th>
                                            <th className="px-6 py-4 font-bold tracking-wider">
                                                Title &amp; Tags
                                            </th>
                                            <th className="px-6 py-4 font-bold tracking-wider">
                                                Author
                                            </th>
                                            <th className="px-6 py-4 font-bold tracking-wider">
                                                Date / Reading Time
                                            </th>
                                            <th className="px-6 py-4 font-bold tracking-wider text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {posts.map(post => (
                                            <tr
                                                key={post.slug}
                                                className="bg-white hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="w-16 h-10 object-cover rounded border border-slate-200"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">
                                                        {post.title}
                                                    </div>
                                                    {post.tags &&
                                                        post.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {post.tags.map(
                                                                tag => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600">
                                                    {post.author}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    <div>{post.date}</div>
                                                    {post.readingTime && (
                                                        <div className="text-xs text-slate-400 mt-0.5">
                                                            {
                                                                post.readingTime
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    post
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePost(
                                                                    post.slug
                                                                )
                                                            }
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-500">
                                No blog posts found. Start writing!
                            </div>
                        )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div
                                    key={post.slug}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200"
                                >
                                    <div className="flex gap-4">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-20 h-20 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.tags &&
                                                post.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {post.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                                {post.author}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {post.date}
                                                {post.readingTime && (
                                                    <>
                                                        {' · '}
                                                        {post.readingTime}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => handleEdit(post)}
                                            className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform border border-blue-100"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />{' '}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeletePost(post.slug)
                                            }
                                            className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform border border-rose-100"
                                        >
                                            <TrashIcon className="w-4 h-4" />{' '}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                No blog posts found.
                            </div>
                        )}
                    </div>
                </>
            )}

            {isModalOpen && (
                <BlogModal
                    post={editingPost}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePost}
                />
            )}
        </div>
    );
};

export default AdminBlogPage;
