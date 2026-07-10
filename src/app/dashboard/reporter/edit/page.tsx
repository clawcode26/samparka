"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { ImageCropper } from "@/components/dashboard/ImageCropper";
import { useAuth } from "@/context/AuthContext";
import { fetchArticleById, updateArticle } from "@/lib/articleService";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft, Save, Send, Image as ImageIcon, X, Keyboard } from "lucide-react";
import Link from "next/link";
import Sanscript from "@indic-transliteration/sanscript";

import styles from "../../Dashboard.module.css";

export default function EditArticle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("State Affairs");
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isOdiaEnabled, setIsOdiaEnabled] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!articleId) {
      setError("No article ID provided");
      setLoading(false);
      return;
    }

    async function loadArticle() {
      try {
        const article = await fetchArticleById(articleId!);
        if (article) {
          setTitle(article.title);
          setContent(article.content);
          setCategory(article.category);
          setTagsInput(article.tags ? article.tags.join(", ") : "");
          setImageUrl(article.imageUrl || "");
        } else {
          setError("Article not found in database.");
        }
      } catch (err) {
        console.error("Failed to load article details:", err);
        setError("Error loading article data.");
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [articleId]);

  const handleHeadlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOdiaEnabled) return;
    const triggers = [' ', '.', ',', '?', '!', ';', ':'];
    if (!triggers.includes(e.key)) return;

    const input = e.currentTarget;
    const value = input.value;
    const selectionStart = input.selectionStart || 0;
    const textBeforeCursor = value.slice(0, selectionStart);
    const textAfterCursor = value.slice(selectionStart);

    const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
    if (match) {
      e.preventDefault();
      const word = match[1];
      const transliterated = Sanscript.t(word, 'itrans', 'oriya') + e.key;
      const newTextBefore = textBeforeCursor.slice(0, textBeforeCursor.length - word.length) + transliterated;
      setTitle(newTextBefore + textAfterCursor);
      
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = newTextBefore.length;
      }, 0);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter an article headline.");
      return;
    }
    if (!content.trim() || content === "<p>Write your article here...</p>") {
      setError("Please enter article content.");
      return;
    }
    if (!imageUrl) {
      setError("Please upload and crop a cover image.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    // Excerpt generation
    const div = document.createElement("div");
    div.innerHTML = content;
    const textContent = div.textContent || div.innerText || "";
    const excerpt = textContent.slice(0, 160) + (textContent.length > 160 ? "..." : "");

    // Split tags
    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    try {
      await updateArticle(articleId!, {
        title,
        content,
        excerpt,
        category,
        tags,
        imageUrl,
      });

      setSuccess("Article updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/reporter");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update article.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
      
      {/* Top Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/dashboard/reporter" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Articles
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleUpdate}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--brand-color)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} /> {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--brand-light)", color: "var(--brand-color)", border: "1px solid rgba(139, 26, 16, 0.2)", padding: "12px 16px", borderRadius: "var(--radius)", fontSize: "14px", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "var(--radius)", fontSize: "14px", marginBottom: "24px" }}>
          {success}
        </div>
      )}

      {/* Language / Typing Toggle Switch (Above Headline) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--neutral-100)', padding: '6px 12px', borderRadius: 'var(--radius)', width: 'fit-content', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Keyboard size={14} /> Typing Script:
        </span>
        <button
          type="button"
          onClick={() => setIsOdiaEnabled(false)}
          style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--radius)', border: 'none', background: !isOdiaEnabled ? '#fff' : 'none', color: !isOdiaEnabled ? 'var(--brand-color)' : 'var(--text-light)', boxShadow: !isOdiaEnabled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setIsOdiaEnabled(true)}
          style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: 'var(--radius)', border: 'none', background: isOdiaEnabled ? '#fff' : 'none', color: isOdiaEnabled ? 'var(--brand-color)' : 'var(--text-light)', boxShadow: isOdiaEnabled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
        >
          ଓଡ଼ିଆ (Odia)
        </button>
      </div>

      {/* Editor Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Title Input */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
            Article Headline {isOdiaEnabled && "(ଓଡ଼ିଆ Input Active)"}
          </label>
          <input 
            type="text" 
            placeholder="Enter headline..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleHeadlineKeyDown}
            style={{ width: '100%', fontSize: '24px', fontWeight: 700, fontFamily: isOdiaEnabled ? 'var(--font-odia), serif' : 'var(--font-heading), serif', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', outline: 'none' }}
          />
        </div>

        {/* Row for Category & Custom Tags */}
        <div className={styles.formGrid}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
              Category
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="State Affairs">State Affairs</option>
              <option value="Politics">Politics</option>
              <option value="Business">Business</option>
              <option value="Sports">Sports</option>
              <option value="Education">Education</option>
              <option value="Culture">Culture</option>
              <option value="Health">Health</option>
              <option value="Opinion">Opinion</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
              Custom Tags (comma separated)
            </label>
            <input 
              type="text" 
              placeholder="e.g. cyclone, puri, rath yatra" 
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              style={{ width: '100%', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Cover Image Upload & Crop */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
            Cover Image (16:9 Landscape)
          </label>
          {imageUrl ? (
            <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <img src={imageUrl} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button 
                type="button" 
                onClick={() => setImageUrl("")}
                style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Remove cover image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <ImageCropper onImageUploaded={setImageUrl} />
          )}
        </div>

        {/* Rich Text Editor */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
            Content (English / Odia)
          </label>
          {content !== "" && (
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              isOdiaEnabled={isOdiaEnabled}
              setIsOdiaEnabled={setIsOdiaEnabled}
            />
          )}
        </div>

      </div>
    </div>
  );
}
