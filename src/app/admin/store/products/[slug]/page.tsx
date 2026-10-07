import { AdminStoreProductDetailView } from "@/features/admin/components/admin-store-product-detail-view";

export default async function AdminStoreProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminStoreProductDetailView slug={slug} />;
}
