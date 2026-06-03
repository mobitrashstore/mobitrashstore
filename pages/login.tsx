import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('../pages_components/LoginPage'), { ssr: false });

export default LoginPage;
