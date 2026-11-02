import { AdminPayoutDetailView } from "@/features/admin/components/payouts/admin-payout-detail-view";

export default async function AdminPayoutDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminPayoutDetailView payoutId={id} />; }
