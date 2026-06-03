import dynamic from 'next/dynamic';

const AdminOrdersPage = dynamic(() => import('../../pages_components/AdminOrdersPage'), { ssr: false });

export default AdminOrdersPage;
