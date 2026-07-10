import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing article URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 3600 } // Cache parsed articles for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract paragraphs containing news content
    const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
    const cleanParagraphs = pMatches
      .map(p => {
        // Strip out HTML tags inside the paragraphs
        return p.replace(/<[^>]*>/g, "").trim();
      })
      .filter(p => p.length > 60 && !p.includes("JavaScript") && !p.includes("cookies") && !p.includes("privacy policy")) // filter boilerplate/cookie notices
      .slice(0, 15); // extract top 15 paragraph blocks

    // Reconstruct body content
    const contentHtml = cleanParagraphs.map(p => `<p>${p}</p>`).join("");

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    let title = "Syndicated Article";
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/<[^>]*>/g, "")
        .replace(/ - [^-]+$/, "") // remove site suffixes (e.g. - BBC News)
        .trim();
    }

    return NextResponse.json({
      title,
      content: contentHtml || "<p>Please visit the wire website using the original link to view this full story.</p>",
      excerpt: cleanParagraphs[0] ? cleanParagraphs[0].slice(0, 160) + "..." : "",
      category: "Wire Feed",
      author: "External Wire Reporter",
      publishedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("External article parser error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse external article" }, { status: 500 });
  }
}
