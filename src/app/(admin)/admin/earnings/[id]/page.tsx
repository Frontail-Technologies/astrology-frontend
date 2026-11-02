import { AdminEarningDetailView } from "@/features/admin/components/earnings/admin-earnings-view";

export default async function AdminEarningDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminEarningDetailView earningId={id} />; }
