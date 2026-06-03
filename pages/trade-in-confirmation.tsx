import dynamic from 'next/dynamic';

const TradeInConfirmationPage = dynamic(() => import('../pages_components/TradeInConfirmationPage'), { ssr: false });

export default TradeInConfirmationPage;
