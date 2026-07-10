"use client";

import { useEffect, useState } from "react";
import styles from "../Dashboard.module.css";
import Link from "next/link";
import { Pin, Trash, ExternalLink } from "lucide-react";
import { fetchArticles, togglePinArticle, deleteArticle, Article } from "@/lib/articleService";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function EditorDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchArticles();
        setArticles(data);
      } catch (err) {
        console.error("Failed to load articles for review:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const nextPinned = !currentPinned;
      await togglePinArticle(id, nextPinned);
      
      // Update local state
      setArticles(articles.map(a => a.id === id ? { ...a, pinned: nextPinned } : a));
    } catch (err) {
      console.error("Failed to toggle pin state:", err);
      alert("Failed to toggle pinned status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete article:", err);
      alert("Failed to delete article");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '4px' }}>Workspace News Manager</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Pin stories to the homepage or delete submissions.</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>All Submissions ({articles.length})</div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Pinned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id}>
                <td>
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&auto=format&fit=crop&q=80"} 
                    alt="Thumbnail" 
                    style={{ width: "60px", height: "34px", objectFit: "cover", borderRadius: "2px", border: "1px solid var(--border-color)", display: "block" }}
                  />
                </td>
                <td style={{ fontWeight: 500, width: '35%' }}>{article.title}</td>
                <td>{article.author}</td>
                <td>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td>
                  <button 
                    onClick={() => handleTogglePin(article.id!, article.pinned)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: article.pinned ? "var(--brand-color)" : "var(--neutral-400)", transition: "color 150ms ease" }}
                    title={article.pinned ? "Unpin from home page" : "Pin to home page"}
                  >
                    <Pin size={16} fill={article.pinned ? "var(--brand-color)" : "none"} />
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Link 
                      href={`/article?id=${article.id}`} 
                      target="_blank"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--neutral-600)', textDecoration: "none", fontSize: "13px" }}
                    >
                      <ExternalLink size={14} /> View
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id!)}
                      className={styles.actionBtn} 
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626' }}
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '48px 0' }}>
                  No articles currently in the workspace.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
