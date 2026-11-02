import { AdminStoreProductEditor } from "@/features/admin/components/store/admin-store-product-editor";

export default async function AdminStoreProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStoreProductEditor productId={id} />;
}
