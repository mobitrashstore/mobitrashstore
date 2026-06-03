import dynamic from 'next/dynamic';

const RequestProductPage = dynamic(() => import('../pages_components/RequestProductPage'), { ssr: false });

export default RequestProductPage;
