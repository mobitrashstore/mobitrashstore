import dynamic from 'next/dynamic';

const DataDeletionPage = dynamic(() => import('../pages_components/DataDeletionPage'), { ssr: false });

export default DataDeletionPage;
