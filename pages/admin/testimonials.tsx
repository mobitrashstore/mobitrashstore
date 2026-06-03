import dynamic from 'next/dynamic';

const AdminTestimonialsPage = dynamic(() => import('../../pages_components/AdminTestimonialsPage'), { ssr: false });

export default AdminTestimonialsPage;
