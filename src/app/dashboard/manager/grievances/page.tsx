"use client";

import { useEffect, useState } from "react";
import styles from "../../Dashboard.module.css";
import { AlertCircle, CheckCircle, Clock, Eye, XCircle } from "lucide-react";

interface Grievance {
  id: string;
  name: string;
  email: string;
  type: string;
  articleUrl: string;
  message: string;
  status: "pending" | "reviewing" | "resolved" | "rejected";
  adminNote: string;
  submittedAt: string | null;
  resolvedAt: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  "factual-error": "Factual inaccuracy",
  correction: "Correction request",
  privacy: "Privacy concern",
  editorial: "Editorial conduct",
  copyright: "Copyright dispute",
  "harmful-content": "Harmful content",
  other: "Other",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#b45309", bg: "#fef3c7", icon: Clock },
  reviewing: { label: "Reviewing", color: "#1e40af", bg: "#eff6ff", icon: Eye },
  resolved: { label: "Resolved", color: "#15803d", bg: "#f0fdf4", icon: CheckCircle },
  rejected: { label: "Rejected", color: "#b91c1c", bg: "#fef2f2", icon: XCircle },
};

export default function GrievancesAdmin() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grievance");
      const data = await res.json();
      setGrievances(data.grievances || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const openDetail = (g: Grievance) => {
    setSelected(g);
    setAdminNote(g.adminNote || "");
    setNewStatus(g.status);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grievance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: newStatus, adminNote }),
      });
      if (res.ok) {
        await fetchGrievances();
        setSelected(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    all: grievances.length,
    pending: grievances.filter((g) => g.status === "pending").length,
    reviewing: grievances.filter((g) => g.status === "reviewing").length,
    resolved: grievances.filter((g) => g.status === "resolved").length,
    rejected: grievances.filter((g) => g.status === "rejected").length,
  };

  const filtered =
    filterStatus === "all" ? grievances : grievances.filter((g) => g.status === filterStatus);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--neutral-900)", marginBottom: "4px" }}>
          Grievance Inbox
        </h1>
        <p style={{ color: "var(--text-light)", fontSize: "14px" }}>
          Review and respond to public grievances submitted via the website.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
        {(["pending", "reviewing", "resolved", "rejected"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                background: "#fff",
                border: `1px solid ${filterStatus === s ? cfg.color : "var(--border-color)"}`,
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                transition: "border-color 150ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Icon size={16} color={cfg.color} />
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--neutral-900)" }}>
                {counts[s]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["all", "pending", "reviewing", "resolved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "5px 14px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: filterStatus === s ? "var(--neutral-900)" : "#fff",
              color: filterStatus === s ? "#fff" : "var(--text-muted)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s} {s === "all" ? `(${counts.all})` : `(${counts[s as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-light)" }}>
            Loading grievances…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-light)" }}>
            <AlertCircle size={32} style={{ marginBottom: "12px", opacity: 0.4, display: "block", margin: "0 auto 12px" }} />
            No grievances in this category.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Name / Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => {
                const cfg = STATUS_CONFIG[g.status];
                return (
                  <tr key={g.id}>
                    <td style={{ fontSize: "12px", color: "var(--text-light)" }}>
                      {formatDate(g.submittedAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{g.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-light)" }}>{g.email}</div>
                    </td>
                    <td style={{ fontSize: "13px" }}>{TYPE_LABELS[g.type] || g.type}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: cfg.bg,
                          color: cfg.color,
                          textTransform: "capitalize",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openDetail(g)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel modal */}
      {selected && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-light)", marginBottom: "4px" }}>
                  Grievance · {TYPE_LABELS[selected.type] || selected.type}
                </div>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>{selected.name}</div>
                <div style={{ fontSize: "13px", color: "var(--text-light)" }}>{selected.email}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--text-light)", padding: "4px" }}
              >
                ✕
              </button>
            </div>

            {/* Meta */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "var(--bg-section)", borderRadius: "6px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-light)", marginBottom: "4px" }}>Submitted</div>
                <div style={{ fontSize: "13px", fontWeight: 500 }}>{formatDate(selected.submittedAt)}</div>
              </div>
              <div style={{ background: "var(--bg-section)", borderRadius: "6px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-light)", marginBottom: "4px" }}>Article URL</div>
                <div style={{ fontSize: "12px", wordBreak: "break-all" }}>
                  {selected.articleUrl ? (
                    <a href={selected.articleUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-color)" }}>
                      {selected.articleUrl}
                    </a>
                  ) : "—"}
                </div>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-light)", marginBottom: "8px" }}>
                Message
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-color)", background: "var(--bg-section)", padding: "16px", borderRadius: "6px" }}>
                {selected.message}
              </div>
            </div>

            {/* Update status */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>Update status</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                {(["pending", "reviewing", "resolved", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "4px",
                      border: `1px solid ${newStatus === s ? STATUS_CONFIG[s].color : "var(--border-color)"}`,
                      background: newStatus === s ? STATUS_CONFIG[s].bg : "#fff",
                      color: newStatus === s ? STATUS_CONFIG[s].color : "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--neutral-700)", display: "block", marginBottom: "6px" }}>
                Admin note (optional)
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal notes about this case…"
                style={{
                  width: "100%", border: "1px solid var(--border-color)", borderRadius: "4px",
                  padding: "8px 12px", fontSize: "13px", fontFamily: "inherit",
                  resize: "vertical", outline: "none", marginBottom: "16px",
                }}
              />

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ padding: "8px 16px", border: "1px solid var(--border-color)", borderRadius: "4px", background: "#fff", fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  style={{ padding: "8px 16px", background: "var(--brand-color)", border: "none", color: "#fff", borderRadius: "4px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
