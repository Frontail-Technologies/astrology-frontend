import { AdminPaymentDetailView } from "@/features/admin/components/admin-payment-detail-view";

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminPaymentDetailView paymentId={id} />; }
