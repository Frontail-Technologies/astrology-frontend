import { notFound } from "next/navigation";

import { AdminAstrologerEditor } from "@/features/admin/components/admin-astrologer-editor";
import { astrologers, getAstrologerBySlug } from "@/features/astrologers/data/astrologers";

type AdminAstrologerEditRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return astrologers.map((astrologer) => ({ slug: astrologer.slug }));
}

export default async function AdminAstrologerEditRoute({ params }: AdminAstrologerEditRouteProps) {
  const { slug } = await params;
  const astrologer = getAstrologerBySlug(slug);

  if (!astrologer) notFound();

  return <AdminAstrologerEditor astrologer={astrologer} />;
}
