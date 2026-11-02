import { AdminCalculatorEditor } from "@/features/admin/components/calculators/admin-calculator-editor";

export default async function EditCalculatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCalculatorEditor id={id} />;
}
