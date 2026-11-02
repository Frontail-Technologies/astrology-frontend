import { AdminReviewDetailView } from "@/features/admin/components/reviews/admin-review-detail-view";

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminReviewDetailView reviewId={id} />;
}
