import dynamic from 'next/dynamic';

const CountryPage = dynamic(() => import('../pages_components/CountryPage'), { ssr: false });

export default CountryPage;
