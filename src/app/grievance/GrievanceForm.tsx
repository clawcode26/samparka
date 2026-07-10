"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import styles from "./page.module.css";

const GRIEVANCE_TYPES = [
  { value: "factual-error", label: "Factual inaccuracy" },
  { value: "correction", label: "Correction / clarification request" },
  { value: "privacy", label: "Privacy concern" },
  { value: "editorial", label: "Editorial conduct" },
  { value: "copyright", label: "Copyright dispute" },
  { value: "harmful-content", label: "Offensive or harmful content" },
  { value: "other", label: "Other" },
];

export function GrievanceForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "",
    articleUrl: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/grievance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setStatus("success");
      setForm({ name: "", email: "", type: "", articleUrl: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.formHeading}>Grievance submitted</h2>
          <p className={styles.formSubtitle}>
            Thank you. We have received your submission and will acknowledge it within 3 working
            days. Please check your email for updates.
          </p>
          <button
            className={styles.submitBtn}
            onClick={() => setStatus("idle")}
            style={{ marginTop: "20px" }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <h2 className={styles.formHeading}>Submit a grievance</h2>
      <p className={styles.formSubtitle}>
        Fill out the form below or email us at{" "}
        <a href="mailto:clawcode66@gmail.com" style={{ color: "var(--brand-color)" }}>
          clawcode66@gmail.com
        </a>
        . All submissions are treated confidentially.
      </p>

      {status === "error" && (
        <div className={styles.errorBanner}>
          <Mail size={14} /> {errorMsg}
        </div>
      )}

      <form id="grievance-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label htmlFor="grievance-name" className={styles.label}>
            Full name
          </label>
          <input
            id="grievance-name"
            name="name"
            type="text"
            className={styles.input}
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="grievance-email" className={styles.label}>
            Email address
          </label>
          <input
            id="grievance-email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="grievance-type" className={styles.label}>
            Type of grievance
          </label>
          <select
            id="grievance-type"
            name="type"
            className={styles.select}
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {GRIEVANCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="grievance-article" className={styles.label}>
            Article link <span className={styles.optional}>(if applicable)</span>
          </label>
          <input
            id="grievance-article"
            name="articleUrl"
            type="url"
            className={styles.input}
            placeholder="https://www.samparka.online/article?id=..."
            value={form.articleUrl}
            onChange={handleChange}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="grievance-message" className={styles.label}>
            Description
          </label>
          <textarea
            id="grievance-message"
            name="message"
            className={styles.textarea}
            rows={5}
            placeholder="Describe your grievance in detail. Please be as specific as possible."
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          id="grievance-submit"
          className={styles.submitBtn}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Submitting…" : "Submit grievance"}
        </button>
      </form>
    </div>
  );
}
