import dynamic from 'next/dynamic';

const ReturnPolicyPage = dynamic(() => import('../pages_components/ReturnPolicyPage'), { ssr: false });

export default ReturnPolicyPage;
