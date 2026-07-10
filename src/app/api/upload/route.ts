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
      console.warn("GITHUB_TOKEN is not set. Falling back to local Base64 URL representation.");
      const base64Data = buffer.toString("base64");
      const localUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({ url: localUrl, fallback: true });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1. Get or create release with tag 'media'
    let releaseId: number | null = null;
    try {
      const getReleaseRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/tags/media`,
        { headers }
      );
      if (getReleaseRes.ok) {
        const releaseData = await getReleaseRes.json();
        releaseId = releaseData.id;
      }
    } catch (err) {
      console.error("Error fetching release:", err);
    }

    if (!releaseId) {
      // Create release
      const createReleaseRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            tag_name: "media",
            name: "Media Assets",
            body: "Storage for Biswabani news portal images and videos",
            draft: false,
            prerelease: false,
          }),
        }
      );

      if (!createReleaseRes.ok) {
        const errorText = await createReleaseRes.text();
        throw new Error(`Failed to create GitHub release: ${errorText}`);
      }
      const releaseData = await createReleaseRes.json();
      releaseId = releaseData.id;
    }

    // 2. Upload asset to the release
    const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(
      filename
    )}`;

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
      const errorText = await uploadRes.text();
      throw new Error(`Failed to upload asset to GitHub: ${errorText}`);
    }

    const assetData = await uploadRes.json();
    return NextResponse.json({ url: `/api/media/${assetData.id}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
