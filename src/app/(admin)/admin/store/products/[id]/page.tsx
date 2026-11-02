import { AdminStoreProductDetailView } from "@/features/admin/components/store/admin-store-product-detail-view";

export default async function AdminStoreProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStoreProductDetailView productId={id} />;
}
