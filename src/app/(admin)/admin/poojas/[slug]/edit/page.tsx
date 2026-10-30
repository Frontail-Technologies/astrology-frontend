import { notFound } from "next/navigation";

import { AdminPoojaEditor } from "@/features/admin/components/admin-pooja-editor";
import { getPoojaBySlug, poojas } from "@/features/pooja/data/poojas";

type AdminPoojaEditRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return poojas.map((pooja) => ({ slug: pooja.slug }));
}

export default async function AdminPoojaEditRoute({ params }: AdminPoojaEditRouteProps) {
  const { slug } = await params;
  const pooja = getPoojaBySlug(slug);

  if (!pooja) notFound();

  return <AdminPoojaEditor pooja={pooja} />;
}
