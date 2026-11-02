import { AdminCouponEditor } from "@/features/admin/components/coupons/admin-coupon-editor";

export default async function CouponEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCouponEditor couponId={id} />;
}
