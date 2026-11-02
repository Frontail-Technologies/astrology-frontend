import { AdminPoojaEditor } from "@/features/admin/components/poojas/admin-pooja-editor";

export default async function AdminPoojaEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPoojaEditor poojaId={id} />;
}
