import { AdminCalculatorDetailView } from "@/features/admin/components/calculators/admin-calculator-detail-view";

export default async function CalculatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCalculatorDetailView id={id} />;
}
