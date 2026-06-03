import dynamic from 'next/dynamic';

const ReportProblemPage = dynamic(() => import('../pages_components/ReportProblemPage'), { ssr: false });

export default ReportProblemPage;
