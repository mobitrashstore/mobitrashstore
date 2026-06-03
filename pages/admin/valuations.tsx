import dynamic from 'next/dynamic';

const AdminValuationPage = dynamic(() => import('../../pages_components/AdminValuationPage'), { ssr: false });

export default AdminValuationPage;
