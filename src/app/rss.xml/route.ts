import { allPosts } from "@/lib/content";
import { siteConfig } from "@/lib/constants";

export async function GET() {
  const baseUrl = siteConfig.url;
  const posts = allPosts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteConfig.fullName}</title>
    <link>${baseUrl}</link>
    <description>${siteConfig.description}</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js App Router</generator>
    ${posts
      .map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}${post.url}</link>
      <guid isPermaLink="true">${baseUrl}${post.url}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.excerpt}]]></content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((tag: string) => `<category>${tag}</category>`).join("")}
      <author>${post.author} (${baseUrl})</author>
    </item>`)
      .join("")}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}