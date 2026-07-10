import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, articleUrl, message } = body;

    if (!name || !email || !type || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = await db.collection("grievances").add({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      articleUrl: articleUrl?.trim() || "",
      message: message.trim(),
      status: "pending",          // pending | reviewing | resolved | rejected
      submittedAt: FieldValue.serverTimestamp(),
      resolvedAt: null,
      adminNote: "",
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: any) {
    console.error("Grievance submission error:", err);
    return NextResponse.json({ error: "Failed to submit grievance. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("grievances")
      .orderBy("submittedAt", "desc")
      .get();

    const grievances = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() ?? null,
      resolvedAt: doc.data().resolvedAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json({ grievances });
  } catch (err: any) {
    console.error("Grievance fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch grievances." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status." }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("grievances").doc(id).update({
      status,
      adminNote: adminNote ?? "",
      resolvedAt: ["resolved", "rejected"].includes(status) ? FieldValue.serverTimestamp() : null,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Grievance update error:", err);
    return NextResponse.json({ error: "Failed to update grievance." }, { status: 500 });
  }
}
