"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TUTORIAL_TOPICS, TutorialTopic, TutorialPost } from "@/lib/tutorials-data";
import { TutorialSidebar } from "@/components/tutorials/TutorialSidebar";
import { CodeSnippetView } from "@/components/ui/CodeSnippetView";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Share2,
  CheckCircle2,
  User,
  Edit3,
  Flame,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{
    topicSlug: string;
    postSlug: string;
  }>;
}

export default function TutorialPostDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  const [topic, setTopic] = useState<TutorialTopic | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTopic() {
      try {
        const res = await fetch(`/api/tutorials/${resolvedParams.topicSlug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTopic(json.data);
        } else {
          const fallback = TUTORIAL_TOPICS.find((t) => t.slug === resolvedParams.topicSlug);
          setTopic(fallback);
        }
      } catch {
        const fallback = TUTORIAL_TOPICS.find((t) => t.slug === resolvedParams.topicSlug);
        setTopic(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    loadTopic();
  }, [resolvedParams.topicSlug]);

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm font-medium">Đang tải chuyên đề kỹ thuật...</p>
      </div>
    );
  }

  if (!topic) {
    notFound();
  }

  const currentPostIndex = topic.posts.findIndex((p) => p.slug === resolvedParams.postSlug);
  if (currentPostIndex === -1) {
    notFound();
  }

  const currentPost = topic.posts[currentPostIndex];
  const prevPost = currentPostIndex > 0 ? topic.posts[currentPostIndex - 1] : null;
  const nextPost = currentPostIndex < topic.posts.length - 1 ? topic.posts[currentPostIndex + 1] : null;

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  return (
    <div className="container py-8 sm:py-12 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* --- LEFT SIDEBAR: TOPIC CURRICULUM --- */}
        <TutorialSidebar topic={topic} currentPostSlug={currentPost.slug} />

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl bg-bg-panel border border-border/80 p-6 sm:p-10 shadow-xl space-y-5">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                  Bài {currentPost.order} / {topic.posts.length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentPost.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentPost.updatedAt}
                </span>
              </div>

              {isAuthorized && (
                <Link
                  href={`/admin/tutorials/${topic.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa chuyên đề này</span>
                </Link>
              )}
            </div>

            {/* Post Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary leading-tight tracking-tight">
              {currentPost.title}
            </h1>

            {/* Summary callout */}
            {currentPost.summary && (
              <div className="p-4 rounded-2xl bg-bg-elevated/70 border-l-4 border-accent text-xs sm:text-sm text-text-secondary leading-relaxed shadow-sm">
                <strong>Tóm tắt nội dung: </strong>
                {currentPost.summary}
              </div>
            )}
          </div>

          {/* Code Snippet (Nếu có) */}
          {currentPost.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <FileCode className="w-4 h-4" />
                <span>Mã Nguồn Mẫu (Source Code)</span>
              </div>
              <CodeSnippetView
                code={currentPost.codeSnippet.code}
                language={currentPost.codeSnippet.language}
                filename={currentPost.codeSnippet.filename}
              />
            </div>
          )}

          {/* Rich HTML Content */}
          {currentPost.contentHtml && (
            <div className="rounded-3xl bg-bg-panel border border-border/80 p-6 sm:p-10 shadow-xl">
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-text-primary leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: currentPost.contentHtml }}
              />
            </div>
          )}

          {/* Navigation: Prev / Next Post */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevPost ? (
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold flex items-center gap-2 rounded-xl py-2.5"
              >
                <Link href={`/tutorials/${topic.slug}/${prevPost.slug}`}>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bài trước: {prevPost.title}</span>
                </Link>
              </Button>
            ) : <div />}

            {nextPost && (
              <Button
                asChild
                variant="primary"
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-2 rounded-xl py-2.5 shadow-md"
              >
                <Link href={`/tutorials/${topic.slug}/${nextPost.slug}`}>
                  <span>Bài tiếp: {nextPost.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
