import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing feed URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/xml, text/xml, */*"
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parsedFeed = parseXmlFeed(xmlText);

    return NextResponse.json(parsedFeed);
  } catch (error: any) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse feed" }, { status: 500 });
  }
}

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Strip CDATA wrappers
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/\s+/g, " ") // Clean up whitespace
    .trim();
}

function parseXmlFeed(xmlText: string) {
  const items: any[] = [];
  
  // Try RSS items first
  let itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  let isAtom = false;

  if (itemMatches.length === 0) {
    // Try Atom entries
    itemMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    if (itemMatches.length > 0) {
      isAtom = true;
    }
  }

    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();

    for (const itemXml of itemMatches) {
      let title = "";
      let link = "";
      let pubDate = "";
      let description = "";

      // Parse Title
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      if (titleMatch) {
        title = cleanText(titleMatch[1]);
      }

      // Parse Link
      if (isAtom) {
        const linkHrefMatch = itemXml.match(/<link[^]+href=["']([^"']+)["']/);
        if (linkHrefMatch) {
          link = linkHrefMatch[1];
        }
      } else {
        const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/);
        if (linkMatch) {
          link = cleanText(linkMatch[1]);
        }
      }

      // Parse Pub Date
      const pubDateMatch = itemXml.match(/<(pubDate|published|updated)[^>]*>([\s\S]*?)<\/\1>/);
      if (pubDateMatch) {
        pubDate = cleanText(pubDateMatch[2]);
      }

      // Parse Description/Summary
      const descMatch = itemXml.match(/<(description|summary|content)[^>]*>([\s\S]*?)<\/\1>/);
      if (descMatch) {
        description = cleanText(descMatch[2]);
        if (description.length > 220) {
          description = description.slice(0, 217) + "...";
        }
      }

      // Skip duplicates
      const titleKey = title.toLowerCase().trim();
      if (!titleKey || seenLinks.has(link) || seenTitles.has(titleKey)) {
        continue;
      }
      seenLinks.add(link);
      seenTitles.add(titleKey);

      items.push({
        title,
        link,
        pubDate,
        description
      });
    }

  // Extract Feed Channel Title
  let channelTitle = "Live News Feed";
  if (isAtom) {
    const feedTitleMatch = xmlText.match(/<feed[^>]*>[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/);
    if (feedTitleMatch) {
      channelTitle = cleanText(feedTitleMatch[1]);
    }
  } else {
    const channelTitleMatch = xmlText.match(/<channel[^>]*>[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>/);
    if (channelTitleMatch) {
      channelTitle = cleanText(channelTitleMatch[1]);
    }
  }

  return {
    title: channelTitle,
    items: items.slice(0, 15) // Return top 15 items
  };
}
