import dynamic from 'next/dynamic';

const AdminBrandsPage = dynamic(() => import('../../pages_components/AdminBrandsPage'), { ssr: false });

export default AdminBrandsPage;
