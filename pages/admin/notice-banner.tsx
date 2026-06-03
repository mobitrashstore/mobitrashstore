import dynamic from 'next/dynamic';

const AdminNoticeBannerPage = dynamic(() => import('../../pages_components/AdminNoticeBannerPage'), { ssr: false });

export default AdminNoticeBannerPage;
