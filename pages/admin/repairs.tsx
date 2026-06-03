import dynamic from 'next/dynamic';

const AdminRepairsPage = dynamic(() => import('../../pages_components/AdminRepairsPage'), { ssr: false });

export default AdminRepairsPage;
