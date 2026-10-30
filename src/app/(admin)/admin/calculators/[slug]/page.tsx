import { notFound } from "next/navigation";
import { AdminCalculatorDetailView } from "@/features/admin/components/admin-calculator-detail-view";
import { calculators, getCalculatorBySlug } from "@/features/calculators/data/calculators";
export function generateStaticParams() { return calculators.map((calculator) => ({ slug: calculator.slug })); }
export default async function AdminCalculatorDetailRoute({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const calculator = getCalculatorBySlug(slug); if (!calculator) notFound(); return <AdminCalculatorDetailView calculator={calculator} />; }
