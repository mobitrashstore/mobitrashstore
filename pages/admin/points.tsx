import dynamic from 'next/dynamic';

const AdminPointsPage = dynamic(() => import('../../pages_components/AdminPointsPage'), { ssr: false });

export default AdminPointsPage;
