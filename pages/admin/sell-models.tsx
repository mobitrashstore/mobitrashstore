import dynamic from 'next/dynamic';

const AdminSellModelsPage = dynamic(() => import('../../pages_components/AdminSellModelsPage'), { ssr: false });

export default AdminSellModelsPage;
