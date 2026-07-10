import { Metadata } from "next";
import { fetchArticleByIdServer } from "@/lib/firestoreServer";
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
      // Use REST-based server helper — Firebase Client SDK doesn't work in server components
      const article = await fetchArticleByIdServer(id);
      if (article) {
        const imageUrl: string | undefined =
          typeof article.imageUrl === "string" && article.imageUrl ? article.imageUrl : undefined;

        // If the image is a relative /api/media/... URL, make it absolute
        const absoluteImage = imageUrl?.startsWith("http")
          ? imageUrl
          : imageUrl
          ? `https://www.samparka.online${imageUrl}`
          : undefined;

        return {
          title: `${article.title} | Samparka`,
          description: article.excerpt || "Read the full story on Samparka.",
          openGraph: {
            title: article.title,
            description: article.excerpt || "Read the full story on Samparka.",
            url: `https://www.samparka.online/article?id=${id}`,
            siteName: "Samparka",
            images: absoluteImage
              ? [
                  {
                    url: absoluteImage,
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
            images: absoluteImage ? [absoluteImage] : [],
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
    openGraph: {
      title: "Samparka | ସମ୍ପର୍କ",
      description: "Odisha's most trusted newspaper.",
      url: "https://www.samparka.online",
      siteName: "Samparka",
      type: "website",
    },
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
