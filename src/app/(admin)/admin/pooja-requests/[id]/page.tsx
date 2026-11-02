import { AdminPoojaRequestDetailView } from "@/features/admin/components/pooja-requests/admin-pooja-request-detail-view";

export default async function AdminPoojaRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPoojaRequestDetailView requestId={id} />;
}
