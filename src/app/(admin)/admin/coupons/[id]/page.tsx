import { AdminCouponDetailView } from "@/features/admin/components/coupons/admin-coupon-detail-view";

export default async function CouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCouponDetailView couponId={id} />;
}
