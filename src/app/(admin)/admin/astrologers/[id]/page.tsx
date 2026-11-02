import { AdminAstrologerDetailView } from "@/features/admin/components/astrologers/admin-astrologer-detail-view";

export default async function AdminAstrologerRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminAstrologerDetailView astrologerId={id} />;
}
