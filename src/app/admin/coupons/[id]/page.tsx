import { notFound, redirect } from "next/navigation"; import { couponRepository } from "@/features/coupons/repositories/coupon-repository";
export default async function CouponPage({ params }: { params: Promise<{ id: string }> }) { const coupon = await couponRepository.getById((await params).id); if (!coupon) notFound(); redirect(`/admin/coupons/${coupon.id}/edit`); }
