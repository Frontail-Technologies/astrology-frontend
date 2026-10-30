import { AdminArticleDetailView } from "@/features/admin/components/admin-article-detail-view";
export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) { return <AdminArticleDetailView slug={(await params).slug} />; }
