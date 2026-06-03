import dynamic from 'next/dynamic';

const AdminProblemReportsPage = dynamic(() => import('../../pages_components/AdminProblemReportsPage'), { ssr: false });

export default AdminProblemReportsPage;
