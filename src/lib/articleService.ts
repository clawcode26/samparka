import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";

export interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  pinned: boolean;
  imageUrl: string;
  author: string;
  authorEmail: string;
  publishedAt: string;
  reads: number;
}

const articlesCollection = collection(db, "articles");

export async function fetchArticles(): Promise<Article[]> {
  try {
    const q = query(articlesCollection, orderBy("publishedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function fetchPinnedArticles(): Promise<Article[]> {
  try {
    const q = query(articlesCollection, where("pinned", "==", true), orderBy("publishedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
  } catch (error) {
    console.error("Error fetching pinned articles:", error);
    return [];
  }
}

export async function fetchArticlesByTag(tag: string): Promise<Article[]> {
  try {
    const q = query(
      articlesCollection, 
      where("tags", "array-contains", tag.toLowerCase().trim()), 
      orderBy("publishedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
  } catch (error) {
    console.error(`Error fetching articles with tag ${tag}:`, error);
    return [];
  }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Article;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching article by id ${id}:`, error);
    return null;
  }
}

export async function createArticle(article: Omit<Article, "id" | "reads">): Promise<string> {
  const docRef = await addDoc(articlesCollection, {
    ...article,
    tags: article.tags.map(t => t.toLowerCase().trim()),
    reads: 0,
    publishedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function togglePinArticle(id: string, pinned: boolean): Promise<void> {
  const docRef = doc(db, "articles", id);
  await updateDoc(docRef, { pinned });
}

export async function deleteArticle(id: string): Promise<void> {
  const docRef = doc(db, "articles", id);
  await deleteDoc(docRef);
}

export async function fetchArticlesByCategory(categoryName: string): Promise<Article[]> {
  try {
    const q = query(
      articlesCollection,
      where("category", "==", categoryName),
      orderBy("publishedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[];
  } catch (error) {
    console.error(`Error fetching articles for category ${categoryName}:`, error);
    return [];
  }
}

export async function updateArticle(id: string, article: Partial<Article>): Promise<void> {
  const docRef = doc(db, "articles", id);
  await updateDoc(docRef, {
    ...article,
    tags: article.tags ? article.tags.map(t => t.toLowerCase().trim()) : undefined
  });
}
