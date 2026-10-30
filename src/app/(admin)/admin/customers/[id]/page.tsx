import { AdminCustomerDetailView } from "@/features/admin/components/admin-customer-detail-view";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCustomerDetailView customerId={id} />;
}
