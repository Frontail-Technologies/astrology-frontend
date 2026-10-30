import { AdminChatSessionDetailView } from "@/features/admin/components/admin-chat-sessions-view";

export default async function AdminChatSessionDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminChatSessionDetailView sessionId={id} />; }
