import { notFound } from "next/navigation";

import { AdminAstrologerDetailView } from "@/features/admin/components/admin-astrologer-detail-view";
import { astrologers, getAstrologerBySlug } from "@/features/astrologers/data/astrologers";

type AdminAstrologerRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return astrologers.map((astrologer) => ({ slug: astrologer.slug }));
}

export default async function AdminAstrologerRoute({ params }: AdminAstrologerRouteProps) {
  const { slug } = await params;
  const astrologer = getAstrologerBySlug(slug);

  if (!astrologer) notFound();

  return <AdminAstrologerDetailView astrologer={astrologer} />;
}
