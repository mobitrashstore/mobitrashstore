import dynamic from 'next/dynamic';

const AdminGalleryPage = dynamic(() => import('../../pages_components/AdminGalleryPage'), { ssr: false });

export default AdminGalleryPage;
