import dynamic from 'next/dynamic';

const ProfilePage = dynamic(() => import('../pages_components/ProfilePage'), { ssr: false });

export default ProfilePage;
