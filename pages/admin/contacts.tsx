import dynamic from 'next/dynamic';

const AdminContactsPage = dynamic(() => import('../../pages_components/AdminContactsPage'), { ssr: false });

export default AdminContactsPage;
