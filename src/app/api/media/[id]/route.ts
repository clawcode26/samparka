import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || "sampark-media";
    const repo = process.env.GITHUB_REPO || "biswabani-assets";

    if (!token) {
      return new Response("GitHub Token not configured", { status: 500 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/octet-stream", // Crucial: gets the raw binary asset content
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // GitHub redirects to the raw asset location (e.g. AWS S3), so we must follow redirects
    const assetRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${id}`,
      { headers, redirect: "follow" }
    );

    if (!assetRes.ok) {
      return new Response(`Failed to fetch asset from GitHub: ${assetRes.statusText}`, {
        status: assetRes.status,
      });
    }

    const contentType = assetRes.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await assetRes.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache heavily for performance
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
