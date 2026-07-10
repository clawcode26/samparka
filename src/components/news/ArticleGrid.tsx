import styles from "./ArticleGrid.module.css";
import Link from "next/link";

const mainArticles = [
  {
    category: "Politics",
    title: "Assembly session to address Mahanadi water dispute in monsoon sitting",
    author: "Sarada Panda",
    time: "3 hrs ago",
    img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "Education",
    title: "CBSE Plus II results out: Kalahandi girl tops with 99.2%",
    author: "Anita Sahu",
    time: "5 hrs ago",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "Culture",
    title: "Puri Rath Yatra 2026: Record 12 lakh devotees expected; route finalised",
    author: "Meena Das",
    time: "7 hrs ago",
    img: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "Business",
    title: "NALCO posts record quarterly profit, plans 3 new plants in Angul",
    author: "Ritesh Mohanty",
    time: "8 hrs ago",
    img: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&auto=format&fit=crop&q=80",
  },
];

const moreArticles = [
  {
    category: "National",
    title: "Centre extends PM-KISAN scheme; direct benefit to 11 lakh Odisha farmers",
    author: "Wire Desk",
    time: "2 hrs ago",
    img: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "International",
    title: "Odisha diaspora in UAE organises cultural festival drawing 4,000 attendees",
    author: "Correspondent",
    time: "4 hrs ago",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "Sports",
    title: "Odisha FC signs three internationals ahead of ISL 2026–27 season opener",
    author: "Sports Desk",
    time: "6 hrs ago",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80",
  },
  {
    category: "Health",
    title: "State launches free dialysis programme at 28 district hospitals",
    author: "Health Desk",
    time: "9 hrs ago",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
  },
];

function ArticleCard({ article }: { article: typeof mainArticles[0] }) {
  return (
    <article className={styles.articleCard}>
      <img src={article.img} alt={article.title} className={styles.articleImage} />
      <div className={styles.articleCategory}>{article.category}</div>
      <h3 className={styles.articleTitle}>
        <Link href="/article">{article.title}</Link>
      </h3>
      <div className={styles.articleMeta}>
        <span className={styles.articleAuthor}>{article.author}</span>
        <span>·</span>
        <span>{article.time}</span>
      </div>
    </article>
  );
}

export function ArticleGrid() {
  return (
    <>
      {/* Section 1 */}
      <section className={styles.gridSection}>
        <div className="container">
          <div className={styles.grid2Col}>
            {mainArticles.map((a, i) => <ArticleCard key={i} article={a} />)}
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className={styles.gridSection} style={{ borderTop: "1px solid var(--border-color)" }}>
        <div className="container">
          <div className={styles.grid2Col}>
            {moreArticles.map((a, i) => <ArticleCard key={i} article={a} />)}
          </div>
        </div>
      </section>
    </>
  );
}
