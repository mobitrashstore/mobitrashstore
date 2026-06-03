import dynamic from 'next/dynamic';

const AdminReviewsPage = dynamic(() => import('../../pages_components/AdminReviewsPage'), { ssr: false });

export default AdminReviewsPage;
