import dynamic from 'next/dynamic';

const SpinWinPage = dynamic(() => import('../pages_components/SpinWinPage'), { ssr: false });

export default SpinWinPage;
