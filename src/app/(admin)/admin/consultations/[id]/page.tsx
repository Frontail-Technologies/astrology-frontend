import { AdminConsultationDetailView } from "@/features/admin/components/admin-consultation-detail-view";

export default async function AdminConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminConsultationDetailView consultationId={id} />;
}
