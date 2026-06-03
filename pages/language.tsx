import dynamic from 'next/dynamic';

const LanguagePage = dynamic(() => import('../pages_components/LanguagePage'), { ssr: false });

export default LanguagePage;
