import dynamic from 'next/dynamic';

const AdminProductRequestsPage = dynamic(() => import('../../pages_components/AdminProductRequestsPage'), { ssr: false });

export default AdminProductRequestsPage;
