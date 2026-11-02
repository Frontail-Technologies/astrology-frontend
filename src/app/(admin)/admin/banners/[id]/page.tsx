import { AdminBannerDetailView } from "@/features/admin/components/banners/admin-banner-detail-view";

export default async function BannerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminBannerDetailView id={id} />;
}
