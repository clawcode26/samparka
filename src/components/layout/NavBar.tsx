import styles from "./NavBar.module.css";
import Link from "next/link";

const navLinks = [
  { label: "Today's Paper", href: "#", highlight: true },
  { label: "Odisha", href: "/category/odisha" },
  { label: "Politics", href: "/category/politics" },
  { label: "Business", href: "/category/business" },
  { label: "Sports", href: "/category/sports" },
  { label: "Culture", href: "/category/culture" },
  { label: "Education", href: "/category/education" },
  { label: "Health", href: "/category/health" },
  { label: "Opinion", href: "/category/opinion" },
  { label: "National", href: "/category/national" },
  { label: "International", href: "/category/international" },
  { label: "Entertainment", href: "/category/entertainment" },
  { label: "Technology", href: "/category/technology" },
];

export function NavBar() {
  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={`container ${styles.navInner}`}>
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={link.highlight ? styles.navHighlight : styles.navLink}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
