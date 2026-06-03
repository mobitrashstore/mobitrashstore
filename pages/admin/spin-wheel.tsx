import dynamic from 'next/dynamic';

const AdminSpinWheelPage = dynamic(() => import('../../pages_components/AdminSpinWheelPage'), { ssr: false });

export default AdminSpinWheelPage;
