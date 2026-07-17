import styles from "./ComingSoon.module.css";
import { Clock, Newspaper, Bell } from "lucide-react";

export function ComingSoon() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconRow}>
          <Newspaper size={40} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>Samparka</h1>

        <div className={styles.divider} />

        <h2 className={styles.heading}>Page Under Maintenance</h2>
        <p className={styles.description}>
          We&apos;re currently making improvements to serve you better.
          The site is temporarily unavailable. Please check back soon —
          we&apos;ll be back up and running shortly.
        </p>

        <div className={styles.badgeRow}>
          <div className={styles.badge}>
            <Clock size={14} />
            <span>Under Maintenance</span>
          </div>
          <div className={styles.badge}>
            <Bell size={14} />
            <span>Back Soon</span>
          </div>
        </div>

        <div className={styles.contactBlock}>
          <p>For inquiries, reach us at</p>
          <a href="mailto:contact@samparka.online" className={styles.email}>
            contact@samparka.online
          </a>
        </div>

        <div className={styles.devBlock}>
          <img src="/clawcode-logo.png" alt="Clawcode" className={styles.devLogo} />
          <span>Developed by <strong>Clawcode</strong>, a registered enterprise under MSME, Govt. of India</span>
        </div>

      </div>
    </div>
  );
}
