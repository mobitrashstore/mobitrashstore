import dynamic from 'next/dynamic';

const WishlistPage = dynamic(() => import('../pages_components/WishlistPage'), { ssr: false });

export default WishlistPage;
