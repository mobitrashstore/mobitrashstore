import dynamic from 'next/dynamic';

const BlogPage = dynamic(() => import('../../pages_components/BlogPage'), { ssr: false });

export default BlogPage;
