import dynamic from 'next/dynamic';

const CategoriesPage = dynamic(() => import('../pages_components/CategoriesPage'), { ssr: false });

export default CategoriesPage;
