import { AdminPoojaDetailView } from "@/features/admin/components/poojas/admin-pooja-detail-view";

export default async function AdminPoojaRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPoojaDetailView poojaId={id} />;
}
