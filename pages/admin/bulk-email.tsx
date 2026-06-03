import dynamic from 'next/dynamic';

const AdminBulkEmailPage = dynamic(() => import('../../pages_components/AdminBulkEmailPage'), { ssr: false });

export default AdminBulkEmailPage;
