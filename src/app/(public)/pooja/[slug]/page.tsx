import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PoojaDetailPage } from "@/features/pooja/components/pooja-detail-page";
import { getPoojaBySlug, poojas } from "@/features/pooja/data/poojas";

type PoojaDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return poojas.map((pooja) => ({ slug: pooja.slug }));
}

export async function generateMetadata({
  params,
}: PoojaDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const pooja = getPoojaBySlug(slug);

  if (!pooja) {
    return { title: "Pooja Not Found | Online Pooja | Astrology" };
  }

  return {
    title: `${pooja.name} | Online Pooja | Astrology`,
    description: `Explore ${pooja.name} details, traditional context, preparation guidance and the online request process.`,
  };
}

export default async function PoojaDetailRoute({
  params,
}: PoojaDetailRouteProps) {
  const { slug } = await params;
  const pooja = getPoojaBySlug(slug);

  if (!pooja) {
    notFound();
  }

  return <PoojaDetailPage pooja={pooja} />;
}
