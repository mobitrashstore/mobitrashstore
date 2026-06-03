import dynamic from 'next/dynamic';

const ComparePage = dynamic(() => import('../pages_components/ComparePage'), { ssr: false });

export default ComparePage;
