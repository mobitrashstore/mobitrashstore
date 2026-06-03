import dynamic from 'next/dynamic';

const AdminTradeInsPage = dynamic(() => import('../../pages_components/AdminTradeInsPage'), { ssr: false });

export default AdminTradeInsPage;
