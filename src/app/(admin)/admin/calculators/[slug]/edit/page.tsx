import { notFound } from "next/navigation";
import { AdminCalculatorEditor } from "@/features/admin/components/admin-calculator-editor";
import { calculators, getCalculatorBySlug } from "@/features/calculators/data/calculators";
export function generateStaticParams() { return calculators.map((calculator) => ({ slug: calculator.slug })); }
export default async function AdminCalculatorEditRoute({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const calculator = getCalculatorBySlug(slug); if (!calculator) notFound(); return <AdminCalculatorEditor calculator={calculator} />; }
