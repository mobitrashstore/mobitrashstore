import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const AdminNotebookPage = dynamic(() => import('../../../pages_components/AdminNotebookPage'), { ssr: false });

export default function AdminNotebook(props: any) {
  const router = useRouter();
  const { location } = router.query;

  if (!location) return null;

  // Resolve Location Casing
  const shopLocation = String(location).toLowerCase() === 'nayabazar' ? 'Nayabazar' : 'Townplanning';

  return <AdminNotebookPage shopLocation={shopLocation} {...props} />;
}
