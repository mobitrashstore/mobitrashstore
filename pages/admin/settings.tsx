import dynamic from 'next/dynamic';

const AdminSettingsPage = dynamic(() => import('../../pages_components/AdminSettingsPage'), { ssr: false });

export default AdminSettingsPage;
