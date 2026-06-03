import dynamic from 'next/dynamic';

const OrderHistoryPage = dynamic(() => import('../pages_components/OrderHistoryPage'), { ssr: false });

export default OrderHistoryPage;
