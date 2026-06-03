import dynamic from 'next/dynamic';

const TrackPage = dynamic(() => import('../pages_components/TrackPage'), { ssr: false });

export default TrackPage;
