import type { Metadata } from "next";

import { PublicArticleDetail } from "@/features/articles/components/public-article-detail";
import { articleSeedData } from "@/features/articles/data/articles";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleSeedData.find((item) => item.slug === slug && item.status === "published");
  return article
    ? { title: `${article.title} | Astrology`, description: article.excerpt }
    : { title: "Article unavailable | Astrology" };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <PublicArticleDetail slug={slug} />;
}
