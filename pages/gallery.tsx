import dynamic from 'next/dynamic';

const GalleryPage = dynamic(() => import('../pages_components/GalleryPage'), { ssr: false });

export default GalleryPage;
