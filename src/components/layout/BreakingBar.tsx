"use client";
import styles from "./BreakingBar.module.css";
import Link from "next/link";

const breakingItems = [
  "CM unveils ₹12,000 crore coastal development plan for Odisha",
  "Heavy rain warning issued for 14 districts in Odisha",
  "Odisha startup raises $40M in Series B funding",
  "Puri Rath Yatra 2026: Record devotee turnout expected",
  "CBSE Plus II results: Kalahandi girl tops with 99.2%",
  "NALCO posts record quarterly profit, plans 3 new plants in Angul",
];

const duplicated = [...breakingItems, ...breakingItems];

export function BreakingBar() {
  return (
    <div className={`${styles.bar} notranslate`} translate="no">
      <span className={styles.badge}>⚡ Breaking</span>
      <div className={styles.tickerWrapper}>
        <div className={styles.tickerTrack}>
          {duplicated.map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              <Link href="/article">{item}</Link>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
