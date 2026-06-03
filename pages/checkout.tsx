import dynamic from 'next/dynamic';

const CheckoutPage = dynamic(() => import('../pages_components/CheckoutPage'), { ssr: false });

export default CheckoutPage;
