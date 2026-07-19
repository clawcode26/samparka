import styles from "./Masthead.module.css";
import Link from "next/link";

export function Masthead() {
  return (
    <div className={styles.masthead}>
      <div className={`container ${styles.mastheadInner}`}>
        <div className={styles.mastheadSide} style={{ justifyContent: 'flex-start' }}>
          <video autoPlay loop muted playsInline className={styles.mastheadVideo}>
            <source src="/ad.mp4" type="video/mp4" />
          </video>
        </div>
        <div className={styles.mastheadCenter}>
          <Link href="/" style={{ textDecoration: 'none' }} translate="no" className="notranslate">
            <div className={`${styles.mastheadOdia} notranslate`} translate="no">ସମ୍ପର୍କ</div>
            <div className={`${styles.mastheadOdiaTagline} notranslate`} translate="no">ସତ୍ୟର ସେତୁ, ଜନତାର ସ୍ୱର</div>
            <h1 className={`${styles.mastheadLogo} notranslate`} translate="no">Samparka</h1>
          </Link>
        </div>
        <div className={styles.mastheadSide} style={{ justifyContent: 'flex-end' }}>
          <video autoPlay loop muted playsInline className={styles.mastheadVideo}>
            <source src="/ad.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
