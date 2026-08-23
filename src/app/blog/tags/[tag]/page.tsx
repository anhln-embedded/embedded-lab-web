"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { getPostsByTag as getStaticPostsByTag, getAllTags as getStaticTags, BlogPostData } from "@/lib/content";
import { getPostsByTag as getDynamicPostsByTag, getAllTags as getDynamicTags } from "@/lib/posts-store";
import { BlogPostList } from "@/components/blog/BlogPostList";
import { Tag as TagIcon, ArrowLeft, BookOpen } from "lucide-react";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default function TagPage({ params }: TagPageProps) {
  const resolvedParams = use(params);
  const tag = decodeURIComponent(resolvedParams.tag);

  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const staticPosts = getStaticPostsByTag(tag);
    const dynamicPosts = getDynamicPostsByTag(tag);
    // Combine unique by _id
    const combined = [...dynamicPosts];
    staticPosts.forEach((sp) => {
      if (!combined.some((cp) => cp._id === sp._id)) {
        combined.push(sp);
      }
    });
    setPosts(combined);

    const sTags = getStaticTags();
    const dTags = getDynamicTags();
    const uniqueTags = Array.from(new Set([...sTags, ...dTags])).sort();
    setAllTags(uniqueTags);
  }, [tag]);

  return (
    <div className="container py-12 md:py-16 space-y-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors group mb-2"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Tất cả bài viết</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-accent-muted text-accent text-sm font-mono font-bold border border-accent/30 mx-auto">
          <TagIcon className="h-4 w-4" />
          #{tag}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
          Chuyên đề: #{tag}
        </h1>

        <p className="text-text-secondary text-sm md:text-base">
          Tìm thấy <span className="text-accent font-bold">{posts.length}</span> bài viết chuyên sâu về chủ đề này.
        </p>
      </div>

      {/* Tag cloud bar */}
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto p-4 rounded-xl bg-bg-panel border border-border">
        <Link
          href="/blog"
          className="px-3 py-1 rounded-pill text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          Tất cả
        </Link>
        {allTags.map((t) => (
          <Link
            key={t}
            href={`/blog/tags/${t}`}
            className={`px-3 py-1 rounded-pill text-xs font-mono transition-all ${
              t.toLowerCase() === tag.toLowerCase()
                ? "bg-accent text-white font-bold shadow-sm"
                : "border border-border text-text-secondary hover:border-accent hover:text-text-primary"
            }`}
          >
            #{t}
          </Link>
        ))}
      </div>

      {/* Posts List */}
      <BlogPostList posts={posts} variant="featured" />
    </div>
  );
}
