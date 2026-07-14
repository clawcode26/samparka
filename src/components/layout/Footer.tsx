import styles from "./Footer.module.css";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={`${styles.footerOdia} notranslate`} translate="no">ସମ୍ପର୍କ</div>
            <div className={`${styles.footerOdiaTagline} notranslate`} translate="no">ସତ୍ୟର ସେତୁ, ଜନତାର ସ୍ୱର</div>
            <div className={`${styles.footerLogo} notranslate`} translate="no">Samparka</div>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerColTitle}>Sections</div>
            <ul className={styles.footerLinks}>
              {["Odisha", "Politics", "Business", "Sports", "Culture", "Education", "Health", "Opinion"].map(s => (
                <li key={s}><Link href={`/category/${s.toLowerCase()}`}>{s}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom} style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start", textAlign: "left" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              <MessageCircle size={20} />
            </a>
          </div>
          <span>© 2026 Samparka. A product/service of Clawcode. All rights reserved.</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} translate="no">
            <img src="/clawcode-logo.png" alt="Clawcode Logo" style={{ height: "16px", width: "16px", borderRadius: "3px", objectFit: "contain", display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "var(--text-light)" }}>Developed by Clawcode, a registered enterprise under MSME, Govt. of India.</span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-light)" }}>
            Privacy · Terms · Cookie Policy ·{" "}
            <Link href="/grievance" style={{ color: "var(--neutral-400)", textDecoration: "none" }}>
              Grievance Redressal
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
