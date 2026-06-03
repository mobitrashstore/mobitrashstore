import dynamic from 'next/dynamic';

const AddressPage = dynamic(() => import('../pages_components/AddressPage'), { ssr: false });

export default AddressPage;
