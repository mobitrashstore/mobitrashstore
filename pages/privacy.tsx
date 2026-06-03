import dynamic from 'next/dynamic';

const PrivacyPage = dynamic(() => import('../pages_components/PrivacyPage'), { ssr: false });

export default PrivacyPage;
