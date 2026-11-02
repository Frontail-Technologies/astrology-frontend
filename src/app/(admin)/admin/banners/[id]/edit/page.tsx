import { AdminBannerEditor } from "@/features/admin/components/banners/admin-banner-editor";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminBannerEditor id={id} />;
}
