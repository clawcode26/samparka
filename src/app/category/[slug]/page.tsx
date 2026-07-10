"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { BreakingBar } from "@/components/layout/BreakingBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { fetchArticlesByCategory, Article } from "@/lib/articleService";
import Link from "next/link";
import { ArrowRight, Newspaper, Rss, Share2 } from "lucide-react";

const CATEGORY_MAP: Record<string, string> = {
  odisha: "State Affairs",
  politics: "Politics",
  business: "Business",
  sports: "Sports",
  culture: "Culture",
  education: "Education",
  health: "Health",
  opinion: "Opinion",
  national: "National",
  international: "International",
  entertainment: "Entertainment",
  technology: "Technology",
  "state-affairs": "State Affairs"
};

const FEED_MAP: Record<string, string> = {
  odisha: "https://news.google.com/rss/search?q=Odisha&hl=en-IN&gl=IN&ceid=IN:en",
  politics: "https://news.google.com/rss/search?q=Indian+Politics&hl=en-IN&gl=IN&ceid=IN:en",
  business: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
  sports: "https://www.espn.com/espn/rss/news",
  culture: "https://news.google.com/rss/search?q=Indian+Culture&hl=en-IN&gl=IN&ceid=IN:en",
  education: "https://news.google.com/rss/search?q=Education+India&hl=en-IN&gl=IN&ceid=IN:en",
  health: "https://news.google.com/rss/search?q=Health+India&hl=en-IN&gl=IN&ceid=IN:en",
  opinion: "https://news.google.com/rss/search?q=Opinion+News+India&hl=en-IN&gl=IN&ceid=IN:en",
  national: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  international: "https://feeds.bbci.co.uk/news/world/rss.xml",
  entertainment: "https://news.google.com/rss/search?q=Entertainment&hl=en-IN&gl=IN&ceid=IN:en",
  technology: "https://techcrunch.com/feed/"
};

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function getCategoryTheme(category: string) {
  const cat = (category || "").toLowerCase().trim();
  if (["odisha", "politics", "opinion", "state affairs", "state-affairs"].includes(cat)) {
    return "themeRed";
  }
  if (["business", "technology"].includes(cat)) {
    return "themeBlue";
  }
  if (["sports", "entertainment"].includes(cat)) {
    return "themePurple";
  }
  return "themeGreen";
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = CATEGORY_MAP[slug?.toLowerCase()] || slug;
  const feedUrl = FEED_MAP[slug?.toLowerCase()];

  useEffect(() => {
    if (!slug) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      setArticles([]);
      setFeedItems([]);

      try {
        // 1. Concurrently fetch local articles
        const localData = await fetchArticlesByCategory(categoryName);
        setArticles(localData);

        // 2. Fetch external wire RSS feed if configured
        if (feedUrl) {
          try {
            const response = await fetch(`/api/feed?url=${encodeURIComponent(feedUrl)}`);
            if (response.ok) {
              const data = await response.json();
              if (!data.error) {
                setFeedItems(data.items || []);
              }
            }
          } catch (feedErr) {
            console.error("Failed to load wire feed:", feedErr);
          }
        }
      } catch (err: any) {
        console.error("Failed to load category news:", err);
        setError("Could not load latest stories for this section. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, categoryName, feedUrl]);

  const hasContent = articles.length > 0 || feedItems.length > 0;

  return (
    <>
      <TopBar />
      <Masthead />
      <NavBar />
      <BreakingBar />

      <main style={{ minHeight: "60vh", paddingBlock: "var(--space-32)" }}>
        <div className="container">
          
          {/* Category Header */}
          <header style={{ borderBottom: "2px solid var(--neutral-900)", paddingBottom: "var(--space-12)", marginBottom: "var(--space-32)" }}>
            <h1 style={{ fontFamily: "var(--font-heading), serif", fontSize: "36px", textTransform: "capitalize", color: "var(--neutral-900)" }}>
              {categoryName} News
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-light)", marginTop: "4px" }}>
              Latest coverage and syndicated feeds for {categoryName}.
            </p>
          </header>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div style={{ padding: "64px 0", textAlign: "center", color: "var(--color-danger)" }}>
              <h3>Error loading stories</h3>
              <p style={{ marginBlock: "12px", color: "var(--text-light)" }}>{error}</p>
            </div>
          ) : !hasContent ? (
            <div style={{ padding: "64px 0", textAlign: "center", color: "var(--text-light)" }}>
              <h3>No articles found in this category.</h3>
              <p style={{ marginBlock: "12px" }}>Be the first to compose a story for {categoryName} in the editorial workspace.</p>
              <Link href="/" style={{ background: "var(--brand-color)", color: "#fff", padding: "8px 16px", borderRadius: "var(--radius)", fontWeight: 600, display: "inline-block" }}>
                Return to Homepage
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              
              {/* ── SECTION 1: Local Reporter News ── */}
              {articles.length > 0 && (
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-color)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "24px" }}>
                    <Newspaper size={16} /> Reporter News
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-24)" }}>
                    {articles.map((article) => (
                      <Link href={`/article?id=${article.id}`} key={article.id} className="premiumCard">
                        {article.imageUrl && (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="premiumCardImage"
                          />
                        )}
                        <div className={`premiumCardBody ${getCategoryTheme(article.category)}`}>
                          <span className="premiumPill">{article.category}</span>
                          <h3 className="premiumCardTitle">{article.title}</h3>
                          <p className="premiumCardDeck">{article.excerpt}</p>
                          
                          {article.tags && article.tags.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto" }} translate="no" className="notranslate">
                              {article.tags.map(t => (
                                <span key={t} style={{ fontSize: "10px", color: "var(--theme-color)", background: "rgba(255, 255, 255, 0.45)", padding: "2px 6px", borderRadius: "2px" }} translate="no" className="notranslate">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="premiumCardFooter">
                          <span style={{ fontSize: "12px", color: "var(--text-light)" }}>By {article.author}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `https://samparka.online/article?id=${article.id}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                              }}
                              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", color: "var(--text-light)" }}
                              title="Share Link"
                            >
                              <Share2 size={14} />
                            </button>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-900)" }}>Read Story</span>
                            <div className="premiumArrow" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms ease" }}>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SECTION 2: Wire Feeds ── */}
              {feedItems.length > 0 && (
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--neutral-700)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "24px" }}>
                    <Rss size={16} /> Latest Wire Updates
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--space-24)" }}>
                    {feedItems.map((item, index) => (
                      <Link href={`/article?url=${encodeURIComponent(item.link)}`} key={index} className="premiumCard">
                        <div className={`premiumCardBody ${getCategoryTheme(categoryName)}`}>
                          <span className="premiumPill">{categoryName}</span>
                          <h3 className="premiumCardTitle">{item.title}</h3>
                          <p className="premiumCardDeck">{item.description}</p>
                        </div>
                        <div className="premiumCardFooter">
                          <span style={{ fontSize: "12px", color: "var(--text-light)" }}>External Wire</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `https://samparka.online/article?url=${encodeURIComponent(item.link)}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied to clipboard!");
                              }}
                              style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", color: "var(--text-light)" }}
                              title="Share Link"
                            >
                              <Share2 size={14} />
                            </button>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--neutral-900)" }}>Explore</span>
                            <div className="premiumArrow" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms ease" }}>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
