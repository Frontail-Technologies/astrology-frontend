import type { Metadata } from "next";

import { CategoryCollectionView } from "@/features/storefront/components/category-collection-view";
import { getCategoryBySlug } from "@/features/store/selectors/store-domain";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Collection | Astrology Store" };
  return {
    title: `${category.name} | Astrology Store`,
    description: category.description ?? `Browse ${category.name} in the Astrology Store.`,
  };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryCollectionView slug={slug} />;
}
