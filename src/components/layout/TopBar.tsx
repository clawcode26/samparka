"use client";
import styles from "./TopBar.module.css";
import Link from "next/link";

export function TopBar() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.topBar}>
      <div className={styles.topRowInner}>
        <span className={styles.topBarDate}>{dateStr}</span>
        <div className={styles.topBarRight}>
          <Link href="#" className={styles.topBarLink}>ePaper</Link>
          <div className={styles.topBarDivider} />
          <Link href="#" className={styles.topBarLink}>Archive</Link>
          <div className={styles.topBarDivider} />
          <Link href="/login" className={styles.topBarLink}>Subscribe</Link>
        </div>
      </div>
    </div>
  );
}
