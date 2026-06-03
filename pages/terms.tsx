import dynamic from 'next/dynamic';

const TermsPage = dynamic(() => import('../pages_components/TermsPage'), { ssr: false });

export default TermsPage;
