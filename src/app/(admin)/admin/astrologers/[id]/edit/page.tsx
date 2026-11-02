import { AdminAstrologerEditor } from "@/features/admin/components/astrologers/admin-astrologer-editor";

export default async function AdminAstrologerEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminAstrologerEditor astrologerId={id} />;
}
