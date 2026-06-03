import dynamic from 'next/dynamic';

const AdminCategoriesPage = dynamic(() => import('../../pages_components/AdminCategoriesPage'), { ssr: false });

export default AdminCategoriesPage;
