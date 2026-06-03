import dynamic from 'next/dynamic';

const SitemapPage = dynamic(() => import('../pages_components/SitemapPage'), { ssr: false });

export default SitemapPage;
