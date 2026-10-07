import { notFound } from "next/navigation";

import { AdminPoojaDetailView } from "@/features/admin/components/admin-pooja-detail-view";
import { getPoojaBySlug, poojas } from "@/features/pooja/data/poojas";

type AdminPoojaRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return poojas.map((pooja) => ({ slug: pooja.slug }));
}

export default async function AdminPoojaRoute({ params }: AdminPoojaRouteProps) {
  const { slug } = await params;
  const pooja = getPoojaBySlug(slug);

  if (!pooja) notFound();

  return <AdminPoojaDetailView pooja={pooja} />;
}
