import { AdminProductReviewDetailView } from "@/features/admin/components/product-reviews/admin-product-review-detail-view";

export default async function ProductReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductReviewDetailView reviewId={id} />;
}
