/**
 * Server-only Firestore helper using the Firestore REST API.
 * This avoids importing Firebase Client SDK on the server (which fails in Node).
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/** Converts a Firestore REST value object to a plain JS value */
function parseValue(val: any): any {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.arrayValue) {
    return (val.arrayValue.values || []).map(parseValue);
  }
  if (val.mapValue) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      result[k] = parseValue(v);
    }
    return result;
  }
  return null;
}

/** Converts a Firestore REST document to a plain object */
function parseDocument(doc: any): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(doc.fields || {})) {
    result[key] = parseValue(val);
  }
  // Extract the document ID from the `name` field
  const nameParts: string[] = (doc.name || "").split("/");
  result.id = nameParts[nameParts.length - 1];
  return result;
}

/** Fetch a single article by Firestore document ID via REST */
export async function fetchArticleByIdServer(id: string): Promise<Record<string, any> | null> {
  try {
    const url = `${FIRESTORE_BASE}/articles/${encodeURIComponent(id)}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const doc = await res.json();
    if (!doc.fields) return null;
    return parseDocument(doc);
  } catch (e) {
    console.error("fetchArticleByIdServer error:", e);
    return null;
  }
}
