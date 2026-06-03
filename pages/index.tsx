import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('../pages_components/HomePage'), { ssr: false });

export default HomePage;
