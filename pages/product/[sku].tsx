import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ProductDetailPage = dynamic(() => import('../../pages_components/ProductDetailPage'), { ssr: false });

export default function ProductDetail(props: any) {
  const router = useRouter();
  const { sku } = router.query;

  if (!sku) return null;
  
  // Clean dynamic SKU references (removing .html and legacy ID suffixes like -iID or -pkID)
  const cleanSku = String(sku)
    .toLowerCase()
    .replace('.html', '')
    .replace(/-i[a-zA-Z0-9_-]+$/, '')
    .replace(/-pk[a-zA-Z0-9_-]+$/, '');

  return <ProductDetailPage sku={cleanSku} {...props} />;
}
