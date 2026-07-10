import { Metadata } from "next";
import { fetchArticleByIdServer } from "@/lib/firestoreServer";
import { fetchArticleById, Article } from "@/lib/articleService";
import { ArticleClient } from "./ArticleClient";

// Permanent absolute URL to the default OG banner (served from /public)
const DEFAULT_OG_IMAGE = "https://www.samparka.online/og-default.png";

interface PageProps {
  searchParams: Promise<{ id?: string; url?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;

  if (id) {
    try {
      const article = await fetchArticleByIdServer(id);
      if (article) {
        const imageUrl: string | undefined =
          typeof article.imageUrl === "string" && article.imageUrl ? article.imageUrl : undefined;

        // Ensure absolute URL — new uploads are already https://storage.googleapis...
        // Older /api/media/... entries get prefixed with domain and suffixed with .jpg for crawlers
        const absoluteImage = imageUrl?.startsWith("http")
          ? imageUrl
          : imageUrl?.startsWith("/api/media/")
          ? `https://www.samparka.online${imageUrl}.jpg`
          : imageUrl
          ? `https://www.samparka.online${imageUrl}`
          : DEFAULT_OG_IMAGE;   // ← fallback for articles with no cover

        return {
          title: `${article.title} | Samparka`,
          description: article.excerpt || "Read the full story on Samparka.",
          openGraph: {
            title: article.title,
            description: article.excerpt || "Read the full story on Samparka.",
            url: `https://www.samparka.online/article?id=${id}`,
            siteName: "Samparka",
            images: [
              {
                url: absoluteImage,
                width: 1200,
                height: 630,
                alt: article.title,
              },
            ],
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.excerpt || "Read the full story on Samparka.",
            images: [absoluteImage],
          },
        };
      }
    } catch (e) {
      console.error("Error generating metadata:", e);
    }
  }

  // Default metadata (no article found or no id)
  return {
    title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
    description: "Odisha's most trusted newspaper. Breaking news, politics, business, sports and culture.",
    openGraph: {
      title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
      description: "Odisha's most trusted newspaper.",
      url: "https://www.samparka.online",
      siteName: "Samparka",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Samparka" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Samparka | ସମ୍ପର୍କ – The Voice of Odisha",
      description: "Odisha's most trusted newspaper.",
      images: [DEFAULT_OG_IMAGE],
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
