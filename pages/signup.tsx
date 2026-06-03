import dynamic from 'next/dynamic';

const SignUpPage = dynamic(() => import('../pages_components/SignUpPage'), { ssr: false });

export default SignUpPage;
