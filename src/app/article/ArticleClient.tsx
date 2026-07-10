"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { BreakingBar } from "@/components/layout/BreakingBar";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { fetchArticleById, fetchArticles, Article } from "@/lib/articleService";
import styles from "./Article.module.css";
import Link from "next/link";
import { Calendar, Eye, Share2, Tag, User } from "lucide-react";

export function ArticleClient({ initialArticle }: { initialArticle: Article | null }) {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const articleUrl = searchParams.get("url");

  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(!initialArticle);

  useEffect(() => {
    if (!articleId && !articleUrl) {
      setLoading(false);
      return;
    }

    async function loadArticle() {
      try {
        if (articleId) {
          const data = await fetchArticleById(articleId!);
          if (data) {
            setArticle(data);
          }
        } else if (articleUrl) {
          const response = await fetch(`/api/article-fetch?url=${encodeURIComponent(articleUrl!)}`);
          if (response.ok) {
            const data = await response.json();
            if (!data.error) {
              setArticle({
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                category: data.category,
                author: data.author,
                publishedAt: data.publishedAt,
                pinned: false,
                tags: [],
                imageUrl: "",
                authorEmail: "",
                reads: 0
              });
            }
          }
        }

        // Fetch related articles
        const allArticles = await fetchArticles();
        const filtered = allArticles
          .filter(a => a.id !== articleId)
          .slice(0, 3);
        setRelated(filtered);
      } catch (err) {
        console.error("Failed to load article detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [articleId, articleUrl]);

  if (loading) {
    return (
      <>
        <TopBar />
        <Masthead />
        <NavBar />
        <div style={{ display: "flex", justifyContent: "center", padding: "128px 0" }}>
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <TopBar />
        <Masthead />
        <NavBar />
        <main className={styles.articlePage}>
          <div className="container" style={{ textAlign: "center", padding: "64px 0" }}>
            <h2>Article Not Found</h2>
            <p style={{ color: "var(--text-light)", marginBlock: "16px" }}>
              The story you are looking for might have been removed or the URL is invalid.
            </p>
            <Link href="/" style={{ background: "var(--brand-color)", color: "#fff", padding: "8px 16px", borderRadius: "var(--radius)", fontWeight: 600, display: "inline-block" }}>
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <Masthead />
      <NavBar />
      <BreakingBar />
      
      <main className={styles.articlePage}>
        <div className="container">
          <div className={styles.articleGrid}>
            
            {/* Main Reading Column */}
            <article className={styles.mainCol}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
                <div className={styles.categoryLabel} style={{ margin: 0 }}>{article.category}</div>
              </div>

              <h1 className={styles.headline}>
                {article.title}
              </h1>
              <p className={styles.deck}>
                {article.excerpt}
              </p>
              
              <div className={styles.metaRow}>
                <div style={{ background: "var(--brand-light)", color: "var(--brand-color)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {article.author ? article.author[0].toUpperCase() : "R"}
                </div>
                <div className={styles.metaText}>
                  <span className={styles.authorName}>{article.author}</span>
                  <span className={styles.publishDate}>
                    {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              {/* Share Button Row */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBlock: "16px", paddingBlock: "8px", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
                <button
                  onClick={() => {
                    const shareUrl = articleId 
                      ? `https://samparka.online/article?id=${articleId}`
                      : `https://samparka.online/article?url=${encodeURIComponent(articleUrl || "")}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert("Article link copied to clipboard!");
                  }}
                  translate="no"
                  style={{ border: "none", background: "var(--neutral-100)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: "6px 12px", borderRadius: "9999px", color: "var(--neutral-800)", fontSize: "12px", fontWeight: 600 }}
                >
                  <Share2 size={14} style={{ color: "var(--brand-color)" }} /> Share Article Link
                </button>
              </div>

              {article.imageUrl && (
                <figure className={styles.heroMedia}>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className={styles.heroImage} 
                  />
                </figure>
              )}

              {/* Render dynamic HTML content safely */}
              <div 
                className={styles.articleBody}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tag display under the story */}
              {article.tags && article.tags.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-16)", marginTop: "var(--space-32)" }} translate="no" className="notranslate">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-light)", fontWeight: 600 }}>
                    <Tag size={14} /> Tags:
                  </span>
                  {article.tags.map(t => (
                    <span 
                      key={t}
                      style={{ fontSize: "12px", color: "var(--brand-color)", background: "var(--brand-light)", padding: "4px 8px", borderRadius: "var(--radius)", fontWeight: 600 }}
                      translate="no"
                      className="notranslate"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Right Sidebar: Related News */}
            <aside className={styles.rightCol}>
              <div className={styles.stickySidebar}>
                <div className={styles.sidebarTitle}>Related Stories</div>
                
                {related.length > 0 ? (
                  related.map(item => (
                    <div key={item.id} className={styles.relatedItem}>
                      <span className={styles.relatedCategory}>{item.category}</span>
                      <h4 className={styles.relatedTitle}>
                        <Link href={`/article?id=${item.id}`}>{item.title}</Link>
                      </h4>
                      <span className={styles.relatedMeta}>
                        {new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "13px", color: "var(--text-light)", fontStyle: "italic" }}>
                    No related stories found.
                  </div>
                )}
                
              </div>
            </aside>

          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
