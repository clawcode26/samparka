import styles from "./Footer.module.css";
import Link from "next/link";

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
          <span>© 2026 Samparka. A product/service of Clawcode. All rights reserved.</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} translate="no">
            <img src="/clawcode-logo.png" alt="Clawcode Logo" style={{ height: "16px", width: "16px", borderRadius: "3px", objectFit: "contain", display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "var(--text-light)" }}>Developed by Clawcode, a registered enterprise under MSME, Govt. of India.</span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-light)" }}>Privacy · Terms · Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}
