import { AdminStoreCategoryEditView } from "@/features/admin/components/admin-store-category-edit-view";

export default async function AdminStoreCategoryEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminStoreCategoryEditView slug={slug} />;
}
