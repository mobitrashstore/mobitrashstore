import dynamic from 'next/dynamic';

const AdminLegalPage = dynamic(() => import('../../pages_components/AdminLegalPage'), { ssr: false });

export default AdminLegalPage;
