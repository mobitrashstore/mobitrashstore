import dynamic from 'next/dynamic';

const AdminNotificationsPage = dynamic(() => import('../../pages_components/AdminNotificationsPage'), { ssr: false });

export default AdminNotificationsPage;
