import type { Metadata } from "next";

import { PublicArticlesView } from "@/features/articles/components/public-articles-view";

export const metadata: Metadata = {
  title: "Astrology Articles & Guides | Astrology",
  description: "Read published astrology guides about charts, planetary cycles, relationships, remedies, and reflective practices.",
};

export default function ArticlesPage() {
  return <PublicArticlesView />;
}
