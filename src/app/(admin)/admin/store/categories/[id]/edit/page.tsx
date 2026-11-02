import { AdminStoreCategoryEditor } from "@/features/admin/components/store/admin-store-category-editor";

export default async function AdminStoreCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStoreCategoryEditor categoryId={id} />;
}
