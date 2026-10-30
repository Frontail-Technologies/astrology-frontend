import { notFound, redirect } from "next/navigation"; import { bannerRepository } from "@/features/banners/repositories/banner-repository";
export default async function BannerPage({ params }: { params: Promise<{ id: string }> }) { const banner = await bannerRepository.getById((await params).id); if (!banner) notFound(); redirect(`/admin/banners/${banner.id}/edit`); }
