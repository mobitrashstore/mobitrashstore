import dynamic from 'next/dynamic';

const AdminAboutPage = dynamic(() => import('../../pages_components/AdminAboutPage'), { ssr: false });

export default AdminAboutPage;
