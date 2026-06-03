import dynamic from 'next/dynamic';

const AdminNewsPage = dynamic(() => import('../../pages_components/AdminNewsPage'), { ssr: false });

export default AdminNewsPage;
