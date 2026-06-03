import dynamic from 'next/dynamic';

const CouponsPage = dynamic(() => import('../pages_components/CouponsPage'), { ssr: false });

export default CouponsPage;
