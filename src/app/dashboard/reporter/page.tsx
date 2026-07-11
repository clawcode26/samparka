"use client";

import { useEffect, useState } from "react";
import styles from "../Dashboard.module.css";
import Link from "next/link";
import { Plus, Edit2, Trash, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchArticles, deleteArticle, Article } from "@/lib/articleService";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ReporterDashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allArticles = await fetchArticles();
        // Filter articles belonging to current logged-in reporter
        const myArticles = allArticles.filter(a => a.authorEmail === user?.email);
        setArticles(myArticles);
      } catch (err) {
        console.error("Failed to load reporter articles:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '4px' }}>My Articles</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Manage your drafts and published stories.</p>
        </div>
        <Link href="/dashboard/reporter/compose" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--brand-color)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600 }}>
          <Plus size={16} /> New Article
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>All Stories</div>
        </div>
        {articles.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-light)", fontSize: "14px" }}>
            You haven't written any articles yet. Click "New Article" to get started!
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Views</th>
                <th>Published</th>
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
                  <td style={{ fontWeight: 500, width: '40%' }}>
                    <Link href={`/article?id=${article.id}`} style={{ color: "inherit", textDecoration: "none" }} target="_blank">
                      {article.title}
                    </Link>
                  </td>
                  <td>
                    <span className={styles.statusBadge} style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-color)" }}>
                      {article.category}
                    </span>
                  </td>
                  <td>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-light)", fontWeight: 500 }}>
                      <Eye size={13} />
                      {(article.reads ?? 0).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <Link 
                        href={`/dashboard/reporter/edit?id=${article.id}`}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--neutral-600)" }}
                        title="Edit Article"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(article.id!)} 
                        className={styles.actionBtn}
                        style={{ color: "var(--color-danger)", padding: 0 }}
                        title="Delete Article"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
