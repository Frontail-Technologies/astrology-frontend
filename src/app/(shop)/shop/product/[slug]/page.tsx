import type { Metadata } from "next";

import { ProductDetailView } from "@/features/storefront/components/product-detail-view";
import { getProductBySlug } from "@/features/store/selectors/store-domain";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product | Astrology Store" };
  return {
    title: `${product.name} | Astrology Store`,
    description: product.shortDescription,
  };
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
