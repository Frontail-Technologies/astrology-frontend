import { AdminArticleDetailView } from "@/features/admin/components/articles/admin-article-detail-view";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminArticleDetailView id={id} />;
}
