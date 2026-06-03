import dynamic from 'next/dynamic';

const AdminBannersPage = dynamic(() => import('../../pages_components/AdminBannersPage'), { ssr: false });

export default AdminBannersPage;
