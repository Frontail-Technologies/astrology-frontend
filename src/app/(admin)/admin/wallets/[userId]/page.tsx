import { AdminWalletDetailView } from "@/features/admin/components/admin-wallets-view";

export default async function AdminWalletDetailPage({ params }: { params: Promise<{ userId: string }> }) { const { userId } = await params; return <AdminWalletDetailView customerId={userId} />; }
