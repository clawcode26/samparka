/**
 * Server-only Firestore helper using Firebase Admin SDK.
 * Uses the service account credentials from env vars — never runs on the client.
 */
import { getAdminDb } from "./firebaseAdmin";

/** Fetch a single article by Firestore document ID via Admin SDK */
export async function fetchArticleByIdServer(id: string): Promise<Record<string, any> | null> {
  try {
    const db = getAdminDb();
    const docRef = db.collection("articles").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (e) {
    console.error("fetchArticleByIdServer (Admin SDK) error:", e);
    return null;
  }
}
