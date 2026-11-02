import { AdminNotificationEditor } from "@/features/admin/components/notifications/admin-notification-editor";

export default async function EditNotificationTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminNotificationEditor id={id} />;
}
