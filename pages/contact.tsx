import dynamic from 'next/dynamic';

const ContactPage = dynamic(() => import('../pages_components/ContactPage'), { ssr: false });

export default ContactPage;
