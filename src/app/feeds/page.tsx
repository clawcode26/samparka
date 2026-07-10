"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Masthead } from "@/components/layout/Masthead";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import styles from "./Feeds.module.css";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface FeedData {
  title: string;
  items: FeedItem[];
}

interface Source {
  name: string;
  url: string;
}

const CATEGORIES = [
  { id: "national", label: "National (India)" },
  { id: "international", label: "International" },
  { id: "tech", label: "Technology" },
  { id: "sports", label: "Sports" },
  { id: "business", label: "Business" },
  { id: "custom", label: "Google News Search" },
];

const SOURCES: Record<string, Source[]> = {
  national: [
    { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms" },
    { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
    { name: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories" },
    { name: "Indian Express", url: "https://indianexpress.com/section/india/feed/" },
  ],
  international: [
    { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "Reuters", url: "https://news.google.com/rss/search?q=Reuters&hl=en-IN&gl=IN&ceid=IN:en" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ],
  tech: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  ],
  sports: [
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news" },
    { name: "ESPN Cricinfo", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml" },
  ],
  business: [
    { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms" },
    { name: "Moneycontrol", url: "https://www.moneycontrol.com/rss/latestnews.xml" },
  ],
};

export default function FeedsPage() {
  const [activeCategory, setActiveCategory] = useState("national");
  const [activeSource, setActiveSource] = useState<Source | null>(SOURCES.national[0]);
  const [searchQuery, setSearchQuery] = useState("technology");
  const [feedData, setFeedData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feed content via route handler
  const fetchFeed = async (feedUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/feed?url=${encodeURIComponent(feedUrl)}`);
      if (!response.ok) {
        throw new Error("Failed to load news feed. The source might be temporarily unavailable.");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFeedData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while fetching the feeds.");
    } finally {
      setLoading(false);
    }
  };

  // Run when category changes
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "custom") {
      setActiveSource(null);
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;
      fetchFeed(url);
    } else {
      const defaultSource = SOURCES[categoryId][0];
      setActiveSource(defaultSource);
      fetchFeed(defaultSource.url);
    }
  };

  // Run when specific source is clicked
  const handleSourceChange = (source: Source) => {
    setActiveSource(source);
    fetchFeed(source.url);
  };

  // Run custom search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery.trim())}&hl=en-IN&gl=IN&ceid=IN:en`;
    fetchFeed(url);
  };

  // Initial fetch on mount
  useEffect(() => {
    if (activeSource) {
      fetchFeed(activeSource.url);
    }
  }, []);

  return (
    <>
      <TopBar />
      <Masthead />
      <NavBar />
      
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Live News Aggregator</h1>
          <p className={styles.description}>
            Stay up to date with live feeds direct from leading national and international publications. Select a category or search using Google News below.
          </p>
        </header>

        {/* Category Tab Row */}
        <div className={styles.tabsContainer} role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={activeCategory === cat.id ? styles.activeTabButton : styles.tabButton}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Source filtering pills or search box */}
        {activeCategory !== "custom" && SOURCES[activeCategory] && (
          <div className={styles.sourcesContainer}>
            {SOURCES[activeCategory].map((src) => (
              <button
                key={src.name}
                className={activeSource?.name === src.name ? styles.activeSourcePill : styles.sourcePill}
                onClick={() => handleSourceChange(src)}
              >
                {src.name}
              </button>
            ))}
          </div>
        )}

        {activeCategory === "custom" && (
          <div className={styles.searchSection}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div style={{ flex: 1 }}>
                <label htmlFor="google-news-query" className={styles.searchLabel}>
                  Search Google News
                </label>
                <input
                  id="google-news-query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. technology, sports, Odisha politics"
                  className={styles.searchInput}
                  required
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button type="submit" disabled={loading} className={styles.searchButton}>
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dynamic content rendering */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p className={styles.statusText}>Fetching live feed stories...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.statusText} style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
            <button
              className={styles.retryButton}
              onClick={() => {
                if (activeCategory === "custom") {
                  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;
                  fetchFeed(url);
                } else if (activeSource) {
                  fetchFeed(activeSource.url);
                }
              }}
            >
              Try Again
            </button>
          </div>
        ) : feedData && feedData.items.length > 0 ? (
          <div>
            <div style={{ fontSize: "14px", color: "var(--text-light)", marginBottom: "16px", fontStyle: "italic" }}>
              Showing feed: {feedData.title || activeSource?.name}
            </div>
            <div className={styles.resultsGrid}>
              {feedData.items.map((item, index) => (
                <article key={index} className={styles.articleCard}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.articleCardLink}>
                    <div className={styles.articleHeader}>
                      <span className={styles.articleSource}>
                        {activeCategory === "custom" ? "Google News" : activeSource?.name}
                      </span>
                      {item.pubDate && (
                        <span className={styles.articleDate}>
                          {new Date(item.pubDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className={styles.articleTitle}>{item.title}</h3>
                    {item.description && <p className={styles.articleDescription}>{item.description}</p>}
                  </a>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <p className={styles.statusText}>No articles found in this feed.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
