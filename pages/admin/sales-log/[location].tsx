import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const AdminSalesLogPage = dynamic(() => import('../../../pages_components/AdminSalesLogPage'), { ssr: false });

export default function AdminSalesLog(props: any) {
  const router = useRouter();
  const { location } = router.query;

  if (!location) return null;

  // Resolve Location Casing
  const shopLocation = String(location).toLowerCase() === 'nayabazar' ? 'Nayabazar' : 'Townplanning';

  return <AdminSalesLogPage shopLocation={shopLocation} {...props} />;
}
