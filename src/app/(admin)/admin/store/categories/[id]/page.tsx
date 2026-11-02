import { AdminStoreCategoryDetailView } from "@/features/admin/components/store/admin-store-category-detail-view";

export default async function AdminStoreCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStoreCategoryDetailView categoryId={id} />;
}
