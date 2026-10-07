import { AdminArticleEditor } from "@/features/admin/components/admin-article-editor";
export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) { return <AdminArticleEditor articleSlug={(await params).slug} />; }
