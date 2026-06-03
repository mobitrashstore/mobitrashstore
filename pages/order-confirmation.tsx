import dynamic from 'next/dynamic';

const OrderConfirmationPage = dynamic(() => import('../pages_components/OrderConfirmationPage'), { ssr: false });

export default OrderConfirmationPage;
