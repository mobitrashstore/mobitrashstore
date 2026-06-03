import dynamic from 'next/dynamic';

const TrustPage = dynamic(() => import('../pages_components/TrustPage'), { ssr: false });

export default TrustPage;
