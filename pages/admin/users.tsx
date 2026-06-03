import dynamic from 'next/dynamic';

const AdminUsersPage = dynamic(() => import('../../pages_components/AdminUsersPage'), { ssr: false });

export default AdminUsersPage;
