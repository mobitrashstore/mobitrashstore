import dynamic from 'next/dynamic';

const RedeemPointsPage = dynamic(() => import('../pages_components/RedeemPointsPage'), { ssr: false });

export default RedeemPointsPage;
