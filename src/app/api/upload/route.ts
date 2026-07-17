import { NextResponse } from "next/server";
import { getAdminDb, getAdminApp } from "@/lib/firebaseAdmin";
import { getStorage } from "firebase-admin/storage";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Ensure admin app is initialised (reuse from firebaseAdmin module)
function getAdminStorage() {
  getAdminApp(); // Explicitly initialize the app first
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  return getStorage().bucket(storageBucket);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    /*
    // --- GITHUB ASSET UPLOAD PRESERVED FOR FUTURE/REFERENCE ---
    // The user requested to use Firebase Storage but keep the Github config.
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || "sampark-media";
    const repo = process.env.GITHUB_REPO || "biswabani-assets";
    
    // ... Github upload logic ...
    */

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `news-images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const contentType = file.type || "image/jpeg";

    // Upload to Firebase Storage via Admin SDK
    const bucket = getAdminStorage();
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: { contentType },
    });

    // Make file publicly readable
    await fileRef.makePublic();

    // Use the firebasestorage.googleapis.com format — works reliably with all bucket configs
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
