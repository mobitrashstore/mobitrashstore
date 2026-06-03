import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const AdminStoreStockPage = dynamic(() => import('../../../pages_components/AdminStoreStockPage'), { ssr: false });

export default function AdminStoreStock(props: any) {
  const router = useRouter();
  const { location } = router.query;

  if (!location) return null;

  // Resolve Location Casing
  const shopLocation = String(location).toLowerCase() === 'nayabazar' ? 'Nayabazar' : 'Townplanning';

  return <AdminStoreStockPage shopLocation={shopLocation} {...props} />;
}
