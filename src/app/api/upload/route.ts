import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || "sampark-media";
    const repo = process.env.GITHUB_REPO || "biswabani-assets";

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    if (!token) {
      console.warn("GITHUB_TOKEN is not set.");
      return NextResponse.json({ error: "Upload not configured." }, { status: 500 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1. Get or create the 'media' release
    let releaseId: number | null = null;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/tags/media`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        releaseId = data.id;
      }
    } catch (e) {
      console.error("Error fetching release:", e);
    }

    if (!releaseId) {
      const createRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            tag_name: "media",
            name: "Media Assets",
            body: "Storage for Samparka news portal images",
            draft: false,
            prerelease: false,
          }),
        }
      );
      if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Failed to create GitHub release: ${err}`);
      }
      const data = await createRes.json();
      releaseId = data.id;
    }

    // 2. Upload the asset
    const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(filename)}`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": file.type || "application/octet-stream",
        "Content-Length": buffer.length.toString(),
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Failed to upload to GitHub: ${err}`);
    }

    const assetData = await uploadRes.json();

    // browser_download_url is the public CDN link — no auth needed for public repos
    // This is what social crawlers (WhatsApp, Telegram) can freely access
    const publicUrl: string = assetData.browser_download_url;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
