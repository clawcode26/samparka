import { Metadata } from "next";
import { fetchArticleById, Article } from "@/lib/articleService";
import { ArticleClient } from "./ArticleClient";

interface PageProps {
  searchParams: Promise<{ id?: string; url?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;

  if (id) {
    try {
      const article = await fetchArticleById(id);
      if (article) {
        return {
          title: `${article.title} | Samparka`,
          description: article.excerpt || "Read the full story on Samparka.",
          openGraph: {
            title: article.title,
            description: article.excerpt || "Read the full story on Samparka.",
            url: `https://samparka.online/article?id=${id}`,
            siteName: "Samparka",
            images: article.imageUrl
              ? [
                  {
                    url: article.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                  },
                ]
              : [],
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.excerpt || "Read the full story on Samparka.",
            images: article.imageUrl ? [article.imageUrl] : [],
          },
        };
      }
    } catch (e) {
      console.error("Error generating metadata:", e);
    }
  }

  return {
    title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
    description: "Odisha's most trusted newspaper.",
  };
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;

  let initialArticle: Article | null = null;
  if (id) {
    try {
      initialArticle = await fetchArticleById(id);
    } catch (e) {
      console.error("Error pre-fetching article:", e);
    }
  }

  return <ArticleClient initialArticle={initialArticle} />;
}
