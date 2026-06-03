import dynamic from 'next/dynamic';

const AdminCouponsPage = dynamic(() => import('../../pages_components/AdminCouponsPage'), { ssr: false });

export default AdminCouponsPage;
