import { AdminPoojaRequestDetailView } from "@/features/admin/components/admin-pooja-requests-view";

export default async function AdminPoojaRequestDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminPoojaRequestDetailView requestId={id} />; }
