import dynamic from 'next/dynamic';

const NepaliNewsPage = dynamic(() => import('../pages_components/NepaliNewsPage'), { ssr: false });

export default NepaliNewsPage;
