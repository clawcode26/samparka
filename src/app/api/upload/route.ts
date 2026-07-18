import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function getOrCreateRelease(): Promise<{ uploadUrl: string }> {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const tag = "media-assets";
  const headers = getHeaders();

  // Check if release already exists
  const listRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/releases/tags/${tag}`,
    { headers }
  );

  if (listRes.ok) {
    const release = await listRes.json();
    return { uploadUrl: release.upload_url };
  }

  // Create the release
  const createRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/releases`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      tag_name: tag,
      name: "Media Assets",
      body: "Auto-created release for storing uploaded images.",
      draft: false,
      prerelease: false,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create release: ${createRes.status} ${err}`);
  }

  const release = await createRes.json();
  return { uploadUrl: release.upload_url };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { uploadUrl } = await getOrCreateRelease();

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // GitHub expects raw binary with application/octet-stream content type
    // and name as a query parameter
    const assetRes = await fetch(
      `${uploadUrl}?name=${encodeURIComponent(filename)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/octet-stream",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: buffer,
      }
    );

    if (!assetRes.ok) {
      const errText = await assetRes.text();
      console.error("GitHub asset upload failed:", assetRes.status, errText);
      throw new Error(`GitHub upload failed: ${assetRes.status} ${errText}`);
    }

    const asset = await assetRes.json();

    // Return a URL that goes through our /api/media/[id] proxy
    const publicUrl = `/api/media/${asset.id}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
