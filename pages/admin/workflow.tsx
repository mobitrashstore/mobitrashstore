import dynamic from 'next/dynamic';

const AdminWorkflowPage = dynamic(() => import('../../pages_components/AdminWorkflowPage'), { ssr: false });

export default AdminWorkflowPage;
