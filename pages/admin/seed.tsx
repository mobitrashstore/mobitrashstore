import dynamic from 'next/dynamic';

const AdminSeedPage = dynamic(() => import('../../pages_components/AdminSeedPage'), { ssr: false });

export default AdminSeedPage;
