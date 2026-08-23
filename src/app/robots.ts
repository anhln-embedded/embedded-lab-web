import { MetadataRoute } from "next";
import { allPosts } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/newsletter/archive/", "/courses/*/lesson/"],
    },
    sitemap: "https://embeddedlab.io/sitemap.xml",
    host: "https://embeddedlab.io",
  };
}