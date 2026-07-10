"use client";

import { useEffect, useState } from "react";
import styles from "./HeroSection.module.css";
import Link from "next/link";
import { fetchArticles, Article } from "@/lib/articleService";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tag, TrendingUp, Calendar, Eye, Pin, ArrowRight, Share2 } from "lucide-react";

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

export function HeroSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchArticles();
        setArticles(data);
      } catch (err) {
        console.error("Failed to load articles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Filter articles based on selected tag
  const filteredArticles = selectedTag
    ? articles.filter(a => a.tags?.includes(selectedTag.toLowerCase().trim()))
    : articles;

  // Find pinned article for Hero slot (or latest if none are pinned)
  const heroArticle = articles.find(a => a.pinned) || articles[0];

  // Side articles: the latest 4 articles excluding the hero article
  const sideArticles = filteredArticles
    .filter(a => a.id !== heroArticle?.id)
    .slice(0, 4);

  // Sub articles: the next 6 articles excluding the hero and side articles
  const sideArticleIds = new Set(sideArticles.map(a => a.id));
  const subArticles = filteredArticles
    .filter(a => a.id !== heroArticle?.id && !sideArticleIds.has(a.id))
    .slice(0, 6);

  // Trending articles: top 4 sorted by reads
  const trendingArticles = [...articles]
    .sort((a, b) => (b.reads || 0) - (a.reads || 0))
    .slice(0, 4);

  return (
    <section className={styles.heroSection}>
      <div className="container">
        
        {/* Selected Tag Filter Banner */}
        {selectedTag && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--brand-light)", border: "1px solid rgba(139, 26, 16, 0.2)", padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "var(--space-24)", fontSize: "14px", color: "var(--brand-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag size={16} />
              <span>Showing stories tagged with <strong>#{selectedTag}</strong></span>
            </div>
            <button 
              onClick={() => setSelectedTag(null)}
              style={{ background: "none", border: "none", color: "var(--neutral-800)", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className={styles.heroGrid}>

          {/* ── LEFT COLUMN ── */}
          <div className={styles.leftCol}>
            
            {/* Top section: Hero Article + Side Articles */}
            <div className={styles.topSection}>
              
              {/* Hero Article */}
              {heroArticle && !selectedTag ? (
                <article className={styles.heroArticle}>
                  {heroArticle.imageUrl ? (
                    <div className={styles.heroImageCard}>
                      <img
                        src={heroArticle.imageUrl}
                        alt={heroArticle.title}
                        className={styles.heroImage}
                      />
                      <div className={styles.heroOverlay} />
                      <div className={styles.heroOverlayText}>
                        <div className={styles.heroEyebrow}>
                          {heroArticle.pinned && (
                            <span className={styles.heroExclusive} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Pin size={10} /> Pinned
                            </span>
                          )}
                          <span className={styles.heroCategoryDot}></span>
                          <span className={styles.heroCategory}>{heroArticle.category}</span>
                        </div>
                        <h2 className={styles.heroTitle}>
                          <Link href={`/article?id=${heroArticle.id}`}>{heroArticle.title}</Link>
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "24px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", backgroundColor: "var(--neutral-100)", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand-color)", letterSpacing: "0.05em" }}>
                        {heroArticle.pinned && (
                          <span style={{ background: "var(--brand-color)", color: "#fff", padding: "2px 6px", borderRadius: "2px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        <span>{heroArticle.category}</span>
                      </div>
                      <h2 style={{ fontSize: "28px", fontWeight: 700, fontFamily: "var(--font-heading), serif", lineHeight: 1.2, marginBlock: "8px" }}>
                        <Link href={`/article?id=${heroArticle.id}`} style={{ color: "var(--neutral-900)", textDecoration: "none" }}>{heroArticle.title}</Link>
                      </h2>
                    </div>
                  )}
                  <p className={styles.heroDeck}>{heroArticle.excerpt}</p>
                  
                  {/* Article Tags */}
                  {heroArticle.tags && heroArticle.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBlock: "8px" }}>
                      {heroArticle.tags.map(t => (
                        <span 
                          key={t} 
                          onClick={() => setSelectedTag(t)}
                          style={{ fontSize: "11px", color: "var(--brand-color)", cursor: "pointer", background: "var(--brand-light)", padding: "2px 6px", borderRadius: "2px", fontWeight: 600 }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.heroMeta}>
                    <span>By</span>
                    <span className={styles.heroAuthor}>{heroArticle.author}</span>
                    <span>·</span>
                    <span>{new Date(heroArticle.publishedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </article>
              ) : selectedTag && filteredArticles.length === 0 ? (
                <div style={{ padding: "48px 16px", textAlign: "center", color: "var(--text-light)" }}>
                  No articles found with tag #{selectedTag}.
                </div>
              ) : null}

              {/* Side Articles */}
              <div className={styles.topSideArticles}>
                {sideArticles.map((a, i) => (
                  <article key={i} className={styles.sideListCard}>
                    <div className={styles.sideListContent}>
                      <div className={styles.subCategory}>{a.category}</div>
                      <h3 className={styles.sideListTitle}>
                        <Link href={`/article?id=${a.id}`}>{a.title}</Link>
                      </h3>
                      
                      {/* Tags */}
                      {a.tags && a.tags.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px", marginBottom: "8px" }}>
                          {a.tags.slice(0, 2).map(t => (
                            <span 
                              key={t}
                              onClick={(e) => { e.preventDefault(); setSelectedTag(t); }}
                              style={{ fontSize: "10px", color: "var(--brand-color)", cursor: "pointer", background: "var(--brand-light)", padding: "1px 4px", borderRadius: "2px" }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.subMeta}>
                        <span>{new Date(a.publishedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    {a.imageUrl && (
                      <img 
                        src={a.imageUrl} 
                        alt={a.title} 
                        className={styles.sideListImage} 
                      />
                    )}
                  </article>
                ))}
              </div>
            </div>

            {/* Sub-articles Grid */}
            <div className={styles.subGrid}>
              {subArticles.map((a, i) => (
                <Link href={`/article?id=${a.id}`} key={i} className="premiumCard">
                  {a.imageUrl && (
                    <img 
                      src={a.imageUrl} 
                      alt={a.title}
                      className="premiumCardImage"
                    />
                  )}
                  <div className={`premiumCardBody ${getCategoryTheme(a.category)}`}>
                    <span className="premiumPill">{a.category}</span>
                    <h3 className="premiumCardTitle" style={{ fontSize: "15px" }}>{a.title}</h3>
                    <p className="premiumCardDeck" style={{ fontSize: "12px", WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {a.excerpt}
                    </p>
                    
                    {/* Tags */}
                    {a.tags && a.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "auto" }} translate="no" className="notranslate">
                        {a.tags.slice(0, 3).map(t => (
                          <span 
                            key={t}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedTag(t); }}
                            style={{ fontSize: "9px", color: "var(--theme-color)", background: "rgba(255, 255, 255, 0.45)", padding: "1px 4px", borderRadius: "2px" }}
                            translate="no"
                            className="notranslate"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="premiumCardFooter" style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-light)" }}>By {a.author}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const url = `https://samparka.online/article?id=${a.id}`;
                          navigator.clipboard.writeText(url);
                          alert("Link copied to clipboard!");
                        }}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", color: "var(--text-light)" }}
                        title="Share Link"
                      >
                        <Share2 size={12} />
                      </button>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--neutral-900)" }}>Read Story</span>
                      <div className="premiumArrow" style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms ease" }}>
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN (TRENDING) ── */}
          <aside className={styles.rightCol}>
            <div className={styles.trendingTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} /> Trending Today
            </div>
            {trendingArticles.map((item, idx) => (
              <div key={item.id} className={styles.trendingItem}>
                <div className={styles.trendingNumber}>{String(idx + 1).padStart(2, "0")}</div>
                <div className={styles.trendingContent}>
                  <div className={styles.trendingHeadline}>
                    <Link href={`/article?id=${item.id}`}>{item.title}</Link>
                  </div>
                  <div className={styles.trendingMeta} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{item.category}</span>
                    <span>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <Eye size={10} /> {item.reads || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className={styles.weatherWidget}>
              <div className={styles.weatherCity}>Bhubaneswar</div>
              <div className={styles.weatherTemp}>
                41<span className={styles.weatherUnit}>°C</span>
              </div>
              <div className={styles.weatherDesc}>Partly cloudy · Humidity 67% · Pre-monsoon</div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
