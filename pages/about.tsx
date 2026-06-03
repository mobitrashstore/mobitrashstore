import dynamic from 'next/dynamic';

const AboutPage = dynamic(() => import('../pages_components/AboutPage'), { ssr: false });

export default AboutPage;
