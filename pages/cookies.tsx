import dynamic from 'next/dynamic';

const CookiesPage = dynamic(() => import('../pages_components/CookiesPage'), { ssr: false });

export default CookiesPage;
