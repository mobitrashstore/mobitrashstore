import dynamic from 'next/dynamic';

const AdminMLFeaturesPage = dynamic(() => import('../../pages_components/AdminMLFeaturesPage'), { ssr: false });

export default AdminMLFeaturesPage;
