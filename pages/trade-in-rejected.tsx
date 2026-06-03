import dynamic from 'next/dynamic';

const TradeInRejectedPage = dynamic(() => import('../pages_components/TradeInRejectedPage'), { ssr: false });

export default TradeInRejectedPage;
