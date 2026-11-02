import { AdminArticleEditor } from "@/features/admin/components/articles/admin-article-editor";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminArticleEditor id={id} />;
}
