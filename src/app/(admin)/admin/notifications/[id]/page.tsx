import { AdminNotificationDetailView } from "@/features/admin/components/notifications/admin-notification-detail-view";

export default async function NotificationTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminNotificationDetailView id={id} />;
}
