import { AdminStoreProductEditView } from "@/features/admin/components/admin-store-product-edit-view";

export default async function AdminStoreProductEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminStoreProductEditView slug={slug} />;
}
