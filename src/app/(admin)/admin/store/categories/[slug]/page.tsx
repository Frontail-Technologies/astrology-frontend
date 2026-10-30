import { AdminStoreCategoryDetailView } from "@/features/admin/components/admin-store-category-detail-view";

export default async function AdminStoreCategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminStoreCategoryDetailView slug={slug} />;
}
