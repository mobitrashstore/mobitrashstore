import dynamic from 'next/dynamic';

const EmiCalculatorPage = dynamic(() => import('../pages_components/EmiCalculatorPage'), { ssr: false });

export default EmiCalculatorPage;
