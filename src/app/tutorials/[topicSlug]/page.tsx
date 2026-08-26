"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TutorialTopic } from "@/lib/tutorials-data";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  User,
  GraduationCap,
  Play,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface PageProps {
  params: Promise<{ topicSlug: string }>;
}

export default function TopicDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  const [topic, setTopic] = useState<TutorialTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTopic() {
      try {
        const res = await fetch(`/api/tutorials/${resolvedParams.topicSlug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTopic(json.data);
        } else {
          setTopic(null);
        }
      } catch (e) {
        console.error(e);
        setTopic(null);
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

  const firstPost = topic.posts?.[0];

  return (
    <div className="container py-8 sm:py-12 space-y-10 max-w-5xl mx-auto px-4">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tất cả chuyên đề</span>
        </Link>

        {isAuthorized && (
          <Link
            href={`/admin/tutorials/${topic.id || topic.slug}/edit`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa chuyên đề này</span>
          </Link>
        )}
      </div>

      {/* Hero Topic Header */}
      <div className="relative rounded-3xl bg-bg-panel border border-border/80 p-6 sm:p-10 shadow-2xl space-y-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-4xl sm:text-5xl p-4 rounded-3xl bg-bg-elevated border border-border shadow-inner">
            {topic.icon}
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                {topic.categoryName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                {topic.level}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              {topic.title}
            </h1>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {topic.description}
        </p>

        {/* Action Button */}
        {firstPost && (
          <div className="pt-2 flex items-center gap-3">
            <Button
              asChild
              variant="primary"
              className="bg-accent hover:bg-accent-hover text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg"
            >
              <Link href={`/tutorials/${topic.slug}/${firstPost.slug}`} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>Bắt đầu học từ Bài 1</span>
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Curriculum / Posts List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <span>Danh Sách Bài Viết Trong Chuyên Đề ({topic.posts?.length || 0} bài)</span>
        </h2>

        {topic.posts && topic.posts.length > 0 ? (
          <div className="space-y-3">
            {topic.posts.map((post) => (
              <Link
                key={post.slug}
                href={`/tutorials/${topic.slug}/${post.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-panel border border-border/80 hover:border-accent/50 hover:bg-bg-elevated/40 transition-all shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-bg-elevated border border-border text-accent group-hover:bg-accent group-hover:text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors shadow-inner">
                    {post.order}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted flex-shrink-0 self-end sm:self-center">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                  <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-bg-panel border border-dashed border-border text-text-muted text-xs">
            Chưa có bài viết nào trong chuyên đề này. Admin có thể thêm bài mới qua trang chỉnh sửa.
          </div>
        )}
      </div>
    </div>
  );
}
