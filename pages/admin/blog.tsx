import dynamic from 'next/dynamic';

const AdminBlogPage = dynamic(() => import('../../pages_components/AdminBlogPage'), { ssr: false });

export default AdminBlogPage;
