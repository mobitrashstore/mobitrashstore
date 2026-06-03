import dynamic from 'next/dynamic';

const SellPage = dynamic(() => import('../pages_components/SellPage'), { ssr: false });

export default SellPage;
