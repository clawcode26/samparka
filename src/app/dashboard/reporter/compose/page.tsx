"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/dashboard/RichTextEditor";
import { ImageCropper } from "@/components/dashboard/ImageCropper";
import { useAuth } from "@/context/AuthContext";
import { createArticle } from "@/lib/articleService";
import { ArrowLeft, Save, Send, X, Keyboard, Clock } from "lucide-react";
import Link from "next/link";
import Sanscript from "@indic-transliteration/sanscript";

import styles from "../../Dashboard.module.css";

const DRAFT_KEY = "samparka_article_draft";

interface Draft {
  title: string;
  content: string;
  category: string;
  tagsInput: string;
  imageUrl: string;
  savedAt: string;
}

function saveDraft(data: Omit<Draft, "savedAt">) {
  try {
    const draft: Draft = { ...data, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return draft.savedAt;
  } catch (_) {
    return null;
  }
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch (_) {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (_) {}
}

function formatSavedAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ComposeArticle() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Write your article here...</p>");
  const [category, setCategory] = useState("State Affairs");
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isOdiaEnabled, setIsOdiaEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check if a draft exists and prompt to restore
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.imageUrl)) {
      setShowDraftBanner(true);
    }
  }, []);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
    setTagsInput(draft.tagsInput);
    setImageUrl(draft.imageUrl);
    setLastSaved(draft.savedAt);
    setShowDraftBanner(false);
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  // Auto-save whenever content changes (with 2-second debounce)
  const triggerAutoSave = useCallback(
    (vals: Omit<Draft, "savedAt">) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const savedAt = saveDraft(vals);
        if (savedAt) setLastSaved(savedAt);
      }, 2000);
    },
    []
  );

  useEffect(() => {
    if (showDraftBanner) return; // Don't auto-save while draft banner is visible
    triggerAutoSave({ title, content, category, tagsInput, imageUrl });
  }, [title, content, category, tagsInput, imageUrl, triggerAutoSave, showDraftBanner]);

  const handleHeadlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOdiaEnabled) return;
    const triggers = [" ", ".", ",", "?", "!", ";", ":"];
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
      const transliterated = Sanscript.t(word, "itrans", "oriya") + e.key;
      const newTextBefore =
        textBeforeCursor.slice(0, textBeforeCursor.length - word.length) +
        transliterated;
      setTitle(newTextBefore + textAfterCursor);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = newTextBefore.length;
      }, 0);
    }
  };

  const handleSaveDraftManually = () => {
    const savedAt = saveDraft({ title, content, category, tagsInput, imageUrl });
    if (savedAt) setLastSaved(savedAt);
  };

  const handlePublish = async (e: React.FormEvent) => {
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

    setLoading(true);
    setError("");
    setSuccess("");

    const div = document.createElement("div");
    div.innerHTML = content;
    const textContent = div.textContent || div.innerText || "";
    const excerpt =
      textContent.slice(0, 160) + (textContent.length > 160 ? "..." : "");

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    try {
      await createArticle({
        title,
        content,
        excerpt,
        category,
        tags,
        pinned: false,
        imageUrl,
        author: user?.displayName || "Staff Reporter",
        authorEmail: user?.email || "",
        publishedAt: new Date().toISOString(),
      });

      clearDraft(); // Clean up the draft after successful publish
      setSuccess("Article submitted successfully for review!");
      setTimeout(() => {
        router.push("/dashboard/reporter");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create article in database.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "64px" }}>

      {/* Draft restore banner */}
      {showDraftBanner && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fffbeb", border: "1px solid #fde68a", padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "24px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#92400e" }}>
            <Clock size={15} />
            <strong>Unsaved draft found.</strong> Restore it to continue where you left off?
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button onClick={discardDraft} style={{ padding: "5px 12px", fontSize: "12px", border: "1px solid #fde68a", borderRadius: "var(--radius)", background: "#fff", cursor: "pointer", color: "#92400e" }}>
              Discard
            </button>
            <button onClick={restoreDraft} style={{ padding: "5px 12px", fontSize: "12px", border: "none", borderRadius: "var(--radius)", background: "#d97706", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              Restore Draft
            </button>
          </div>
        </div>
      )}

      {/* Top Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <Link href="/dashboard/reporter" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-light)", fontSize: "14px", fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Articles
        </Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {lastSaved && (
            <span style={{ fontSize: "11px", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} /> Saved at {formatSavedAt(lastSaved)}
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveDraftManually}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--neutral-100)", border: "1px solid var(--border-color)", color: "var(--text-main)", padding: "7px 14px", borderRadius: "var(--radius)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--brand-color)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "var(--radius)", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            <Send size={16} /> {loading ? "Submitting..." : "Submit for Review"}
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

      {/* Language Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--neutral-100)", padding: "6px 12px", borderRadius: "var(--radius)", width: "fit-content", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-700)", display: "flex", alignItems: "center", gap: "6px" }}>
          <Keyboard size={14} /> Typing Script:
        </span>
        <button type="button" onClick={() => setIsOdiaEnabled(false)} style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius)", border: "none", background: !isOdiaEnabled ? "#fff" : "none", color: !isOdiaEnabled ? "var(--brand-color)" : "var(--text-light)", boxShadow: !isOdiaEnabled ? "0 1px 3px rgba(0,0,0,0.1)" : "none", cursor: "pointer" }}>
          English
        </button>
        <button type="button" onClick={() => setIsOdiaEnabled(true)} style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 600, borderRadius: "var(--radius)", border: "none", background: isOdiaEnabled ? "#fff" : "none", color: isOdiaEnabled ? "var(--brand-color)" : "var(--text-light)", boxShadow: isOdiaEnabled ? "0 1px 3px rgba(0,0,0,0.1)" : "none", cursor: "pointer" }}>
          ଓଡ଼ିଆ (Odia)
        </button>
      </div>

      {/* Editor Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
            Article Headline {isOdiaEnabled && "(ଓଡ଼ିଆ Input Active)"}
          </label>
          <input
            type="text"
            placeholder="Enter headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleHeadlineKeyDown}
            style={{ width: "100%", fontSize: "24px", fontWeight: 700, fontFamily: isOdiaEnabled ? "var(--font-odia), serif" : "var(--font-heading), serif", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", outline: "none" }}
          />
        </div>

        {/* Category & Tags */}
        <div className={styles.formGrid}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
              Category
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", fontSize: "14px", outline: "none", backgroundColor: "#fff", cursor: "pointer" }}>
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
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
              Custom Tags (comma separated)
            </label>
            <input type="text" placeholder="e.g. cyclone, puri, rath yatra" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} style={{ width: "100%", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", fontSize: "14px", outline: "none" }} />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
            Cover Image (OG 1200×630)
          </label>
          {imageUrl ? (
            <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <img src={imageUrl} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" onClick={() => setImageUrl("")} style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Remove Image">
                <X size={16} />
              </button>
            </div>
          ) : (
            <ImageCropper onImageUploaded={setImageUrl} />
          )}
        </div>

        {/* Rich Text Editor */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
            Content (English / Odia)
          </label>
          <RichTextEditor content={content} onChange={setContent} isOdiaEnabled={isOdiaEnabled} setIsOdiaEnabled={setIsOdiaEnabled} />
        </div>

      </div>
    </div>
  );
}
