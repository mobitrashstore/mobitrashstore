import dynamic from 'next/dynamic';

const AdminDashboardPage = dynamic(() => import('../../pages_components/AdminDashboardPage'), { ssr: false });

export default AdminDashboardPage;
