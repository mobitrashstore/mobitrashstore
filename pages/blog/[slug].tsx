import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const BlogPostPage = dynamic(() => import('../../pages_components/BlogPostPage'), { ssr: false });

export default function BlogPost(props: any) {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) return null;

  return <BlogPostPage slug={String(slug)} {...props} />;
}
