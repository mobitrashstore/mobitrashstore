import dynamic from 'next/dynamic';

const FaqPage = dynamic(() => import('../pages_components/FaqPage'), { ssr: false });

export default FaqPage;
