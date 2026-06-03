import dynamic from 'next/dynamic';

const AdminInventoryPage = dynamic(() => import('../../pages_components/AdminInventoryPage'), { ssr: false });

export default AdminInventoryPage;
