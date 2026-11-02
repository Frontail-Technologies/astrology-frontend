import { AdminChatDetailView } from "@/features/admin/components/chats/admin-chat-detail-view";
export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) { return <AdminChatDetailView id={(await params).id} />; }
