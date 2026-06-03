import dynamic from 'next/dynamic';

const BuyPage = dynamic(() => import('../../pages_components/BuyPage'), { ssr: false });

export default BuyPage;
