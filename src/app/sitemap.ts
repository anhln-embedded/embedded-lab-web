import { MetadataRoute } from "next";
import { allPosts, allCourses } from "@/lib/content";
import { siteConfig } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/roadmap`, lastModified, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/courses`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/newsletter`, lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];

  const blogUrls: MetadataRoute.Sitemap = allPosts
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${baseUrl}${post.url}`,
      lastModified: post.updated ? new Date(post.updated) : new Date(post.date),
      changeFrequency: "weekly",
      priority: post.featured ? 0.85 : 0.7,
    }));

  const courseUrls: MetadataRoute.Sitemap = allCourses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogUrls, ...courseUrls];
}