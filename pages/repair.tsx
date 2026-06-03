import dynamic from 'next/dynamic';

const RepairPage = dynamic(() => import('../pages_components/RepairPage'), { ssr: false });

export default RepairPage;
