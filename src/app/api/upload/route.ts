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

async function getOrCreateReleaseId(): Promise<number> {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const tag = "media-assets";
  const headers = getHeaders();

  const listRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/releases/tags/${tag}`,
    { headers }
  );

  if (listRes.ok) {
    const release = await listRes.json();
    return release.id;
  }

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
  return release.id;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const releaseId = await getOrCreateReleaseId();
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const contentType = file.type || "image/jpeg";

    // Build a proper multipart form body manually
    const boundary = `----FormBoundary${Date.now()}`;
    const parts: Buffer[] = [];

    // File part
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
    ));
    parts.push(buffer);
    parts.push(Buffer.from("\r\n"));

    // End boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`));

    const body = Buffer.concat(parts);

    const assetRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(filename)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body,
      }
    );

    if (!assetRes.ok) {
      const errText = await assetRes.text();
      console.error("GitHub asset upload failed:", assetRes.status, errText);
      throw new Error(`GitHub upload failed: ${assetRes.status} ${errText}`);
    }

    const asset = await assetRes.json();
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
