import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AstrologerDetailPage } from "@/features/astrologers/components/astrologer-detail-page";
import {
  astrologers,
  getAstrologerBySlug,
} from "@/features/astrologers/data/astrologers";

type AstrologerDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return astrologers
    .filter((astrologer) => astrologer.detail)
    .map((astrologer) => ({ slug: astrologer.slug }));
}

export async function generateMetadata({
  params,
}: AstrologerDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const astrologer = getAstrologerBySlug(slug);

  if (!astrologer?.detail) {
    return { title: "Astrologer Not Found | Astrology" };
  }

  return {
    title: `${astrologer.name} | ${astrologer.detail.role} | Astrology`,
    description: `Learn about ${astrologer.name}: ${astrologer.primaryExpertise}, languages spoken and how consultations work.`,
  };
}

export default async function AstrologerDetailRoute({
  params,
}: AstrologerDetailRouteProps) {
  const { slug } = await params;
  const astrologer = getAstrologerBySlug(slug);

  if (!astrologer?.detail) {
    notFound();
  }

  return <AstrologerDetailPage astrologer={astrologer} />;
}
