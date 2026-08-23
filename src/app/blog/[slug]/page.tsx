"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { getPostBySlug as getStaticPostBySlug, BlogPostData } from "@/lib/content";
import { getPostBySlug as getDynamicPostBySlug } from "@/lib/posts-store";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPostData | null | undefined>(undefined);

  useEffect(() => {
    async function fetchPost() {
      const slug = resolvedParams.slug;

      // 1. Try SQLite API first (database source of truth)
      try {
        const res = await fetch(`/api/posts/${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const p = json.data;
            const formattedPost: BlogPostData = {
              _id: p.id,
              title: p.title,
              slug: p.slug,
              date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-08-25",
              tags: typeof p.tags === "string" ? p.tags.split(",").map((t: string) => t.trim()) : p.tags,
              postType: p.postType,
              pinned: p.pinned,
              likesCount: p.likesCount,
              featured: p.featured,
              draft: p.draft,
              readingTime: p.readingTime,
              author: p.authorName,
              authorTitle: p.authorTitle,
              authorAvatar: p.authorAvatar,
              coverImage: p.coverImage,
              excerpt: p.excerpt,
              facebookPostUrl: p.facebookPostUrl,
              githubUrl: p.githubUrl,
              series: p.series,
              seriesOrder: p.seriesOrder,
              url: `/blog/${p.slug}`,
              contentHtml: p.contentHtml,
              body: {
                raw: p.contentHtml || "",
              },
            };
            setPost(formattedPost);
            return;
          }
        }
      } catch (err) {
        console.warn("SQLite API fetch fallback:", err);
      }

      // 2. Try static content
      const staticPost = getStaticPostBySlug(slug);
      if (staticPost) {
        setPost(staticPost);
        return;
      }

      // 3. Try dynamic local storage
      const dynamicPost = getDynamicPostBySlug(slug);
      if (dynamicPost) {
        setPost(dynamicPost);
      } else {
        setPost(null);
      }
    }

    if (resolvedParams.slug) {
      fetchPost();
    }
  }, [resolvedParams.slug]);

  if (post === undefined) {
    return (
      <div className="container py-24 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Đang tải bài viết từ SQLite Database...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-20 max-w-xl text-center">
        <div className="p-8 rounded-2xl bg-bg-panel border border-border">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-4 text-3xl">
            📄
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Không tìm thấy bài viết
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Bài viết với đường dẫn <code className="text-accent font-mono">/{resolvedParams.slug}</code> không tồn tại hoặc đã được chuyển dời.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-accent text-white">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về danh sách bài viết
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/roadmap">Xem Lộ trình học</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <BlogPostContent post={post} />;
}