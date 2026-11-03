import { AdminFaqEditor } from "@/features/admin/components/faqs/admin-faq-editor";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminFaqEditor id={id} />;
}
