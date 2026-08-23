"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllPosts, deletePost } from "@/lib/posts-store";
import { getAllCourses, deleteCourse } from "@/lib/courses-store";
import { getAllRoadmapTracks, deleteRoadmapTrack } from "@/lib/roadmap-store";
import { BlogPostData, CourseData } from "@/lib/content";
import { RoadmapTrack } from "@/lib/roadmap-store";
import {
  ShieldCheck,
  Edit3,
  PlusCircle,
  Users,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  BookOpen,
  GraduationCap,
  MapPin,
  Eye,
  Plus,
  Layers,
  ArrowRight,
  BarChart3,
  Clock,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, allUsers, quickLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "courses" | "roadmap">("overview");
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [roadmapTracks, setRoadmapTracks] = useState<RoadmapTrack[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = async () => {
    // 1. Fetch posts from SQLite
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(
          json.data.map((p: any) => ({
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
            coverImage: p.coverImage,
            excerpt: p.excerpt,
            url: `/blog/${p.slug}`,
            contentHtml: p.contentHtml,
            body: { raw: p.contentHtml || "" },
          }))
        );
      } else {
        setPosts(getAllPosts());
      }
    } catch {
      setPosts(getAllPosts());
    }

    // 2. Fetch courses from SQLite
    try {
      const res = await fetch("/api/courses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCourses(
          json.data.map((c: any) => ({
            _id: c.id,
            title: c.title,
            slug: c.slug,
            description: c.description,
            level: c.level,
            category: c.category,
            duration: c.duration,
            price: c.price,
            thumbnail: c.thumbnail,
            githubRepo: c.githubRepo,
            featured: c.featured,
            modules: c.modules || [],
          }))
        );
      } else {
        setCourses(getAllCourses());
      }
    } catch {
      setCourses(getAllCourses());
    }

    setRoadmapTracks(getAllRoadmapTracks());
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("embedded_posts_updated", handleUpdate);
    window.addEventListener("embedded_courses_updated", handleUpdate);
    window.addEventListener("embedded_roadmap_updated", handleUpdate);

    return () => {
      window.removeEventListener("embedded_posts_updated", handleUpdate);
      window.removeEventListener("embedded_courses_updated", handleUpdate);
      window.removeEventListener("embedded_roadmap_updated", handleUpdate);
    };
  }, []);

  if (!mounted) return null;

  const isAuthorized = user && (user.role === "superadmin" || user.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className="p-8 rounded-3xl bg-bg-panel border border-border shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Truy Cập Bị Từ Chối (403 Forbidden)
          </h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Khu vực này chỉ dành riêng cho <strong>Ban Quản Trị & Mentor Kỹ Thuật</strong> của Embedded AIoT Laboratory. Tài khoản hiện tại của bạn không có đặc quyền quản trị.
          </p>

          <div className="flex justify-center gap-3">
            <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
              <Link href="/">Quay Về Trang Chủ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Đăng Nhập Tài Khoản Khác</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa bài viết "${title}"?`)) {
      try {
        await fetch(`/api/posts/${id}`, { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
      deletePost(id);
      loadData();
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa khóa học "${title}"?`)) {
      try {
        await fetch(`/api/courses/${id}`, { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
      deleteCourse(id);
      loadData();
    }
  };

  const handleDeleteTrack = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa lộ trình "${title}"?`)) {
      deleteRoadmapTrack(id);
      setRoadmapTracks(getAllRoadmapTracks());
    }
  };

  return (
    <div className="container py-10 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{
                backgroundColor: user.role === "superadmin" ? "rgba(168, 85, 247, 0.15)" : "rgba(240, 90, 40, 0.15)",
                color: user.role === "superadmin" ? "#a855f7" : "#f05a28",
                border: `1px solid ${user.role === "superadmin" ? "rgba(168, 85, 247, 0.3)" : "rgba(240, 90, 40, 0.3)"}`,
              }}
            >
              {user.role === "superadmin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {user.role === "superadmin" ? "Super Admin" : "Admin"}
            </span>
            <span className="text-xs text-text-muted">| {user.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Trung Tâm Quản Trị Nội Dung Lab
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user.role === "superadmin" && (
            <Button variant="outline" size="sm" asChild className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs">
              <Link href="/admin/users">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Thành viên ({allUsers.length})
              </Link>
            </Button>
          )}

          <Button variant="primary" size="sm" asChild className="bg-accent hover:bg-accent-hover text-white text-xs">
            <Link href="/admin/posts/new">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Đăng Bài Viết
            </Link>
          </Button>

          <Button variant="primary" size="sm" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
            <Link href="/admin/courses/new">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              Tạo Khóa Học
            </Link>
          </Button>

          <Button variant="primary" size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            <Link href="/admin/roadmap">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Tạo Lộ Trình
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-bg-panel border border-border mb-8 shadow-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-bg-elevated text-accent shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Tổng Quan
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === "posts"
              ? "bg-bg-elevated text-accent shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          Quản Lý Bài Viết ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === "courses"
              ? "bg-bg-elevated text-accent shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Quản Lý Khóa Học ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeTab === "roadmap"
              ? "bg-bg-elevated text-accent shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Quản Lý Lộ Trình ({roadmapTracks.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-text-muted">Tổng bài viết</span>
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{posts.length}</div>
              <Link href="/admin/posts/new" className="text-[11px] text-accent font-medium hover:underline mt-1 inline-block">
                + Thêm bài viết mới
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-text-muted">Tổng khóa học</span>
                <GraduationCap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{courses.length}</div>
              <Link href="/admin/courses/new" className="text-[11px] text-cyan-400 font-medium hover:underline mt-1 inline-block">
                + Thêm khóa học mới
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-text-muted">Lộ trình học tập</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{roadmapTracks.length}</div>
              <Link href="/admin/roadmap" className="text-[11px] text-emerald-400 font-medium hover:underline mt-1 inline-block">
                + Thêm lộ trình mới
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-bg-panel border border-border/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-text-muted">Thành viên hệ thống</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-text-primary">{allUsers.length}</div>
              <Link href="/admin/users" className="text-[11px] text-purple-400 font-medium hover:underline mt-1 inline-block">
                Quản lý thành viên &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Action Guides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-bg-panel border border-border shadow-md">
              <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                1. Quản lý Bài Viết (Blog)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Soạn thảo bài viết kỹ thuật với trình biên soạn Markdown chuyên sâu, hỗ trợ chèn code C/C++, Python và xem trước Live Preview.
              </p>
              <Button variant="primary" size="sm" asChild className="bg-accent text-white w-full text-xs">
                <Link href="/admin/posts/new">Đăng bài viết mới</Link>
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-bg-panel border border-border shadow-md">
              <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                2. Quản lý Khóa Học
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Tạo khóa học theo từng học phần (Modules) và từng bài giảng (Lessons) có kèm video URL, tóm tắt lý thuyết và code snippet.
              </p>
              <Button variant="primary" size="sm" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white w-full text-xs">
                <Link href="/admin/courses/new">Tạo khóa học mới</Link>
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-bg-panel border border-border shadow-md">
              <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                3. Quản lý Lộ Trình Học
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4">
                Tạo các lộ trình học (Tracks) và các mốc kỹ năng (Milestones/Steps) để sinh viên theo dõi tiến độ và đánh dấu hoàn thành.
              </p>
              <Button variant="primary" size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs">
                <Link href="/admin/roadmap">Thiết lập lộ trình</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Posts Manager */}
      {activeTab === "posts" && (
        <div className="bg-bg-panel border border-border rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Danh Sách Bài Viết ({posts.length})
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Các bài viết hiển thị trực tiếp tại trang Blog và Trang chủ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/blog" target="_blank">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Xem Blog
                </Link>
              </Button>
              <Button variant="primary" size="sm" asChild className="bg-accent text-white text-xs">
                <Link href="/admin/posts/new">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Thêm Bài Viết Mới
                </Link>
              </Button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-xl bg-bg-elevated/30">
              <p className="text-text-muted text-xs mb-4">Chưa có bài viết nào trong hệ thống.</p>
              <Button variant="primary" size="sm" asChild className="bg-accent text-white">
                <Link href="/admin/posts/new">Tạo bài viết đầu tiên</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-text-muted font-semibold bg-bg-elevated/50">
                  <tr>
                    <th className="py-3 px-4">Tiêu đề bài viết</th>
                    <th className="py-3 px-4">Chuyên mục / Tags</th>
                    <th className="py-3 px-4">Tác giả</th>
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-bg-elevated/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="hover:text-accent">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-elevated border border-border">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-muted">{post.author}</td>
                      <td className="py-3.5 px-4 text-xs text-text-muted">{post.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/posts/${post.slug || post._id}/edit`}
                            className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-accent hover:border-accent transition-all flex items-center gap-1 text-xs px-2.5 font-medium"
                            title="Chỉnh sửa bài viết với Google Docs Editor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </Link>
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-text-primary"
                            title="Xem trước trên website"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post._id, post.title)}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Courses Manager */}
      {activeTab === "courses" && (
        <div className="bg-bg-panel border border-border rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                Danh Sách Khóa Học ({courses.length})
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Các khóa học hiển thị tại trang Khóa học (/courses)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/courses" target="_blank">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Xem Khóa Học
                </Link>
              </Button>
              <Button variant="primary" size="sm" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                <Link href="/admin/courses/new">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tạo Khóa Học Mới
                </Link>
              </Button>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-xl bg-bg-elevated/30">
              <p className="text-text-muted text-xs mb-4">Chưa có khóa học nào trong hệ thống.</p>
              <Button variant="primary" size="sm" asChild className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Link href="/admin/courses/new">Tạo khóa học đầu tiên</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-text-muted font-semibold bg-bg-elevated/50">
                  <tr>
                    <th className="py-3 px-4">Tên khóa học</th>
                    <th className="py-3 px-4">Cấp độ</th>
                    <th className="py-3 px-4">Thời lượng & Bài giảng</th>
                    <th className="py-3 px-4">Học phí</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-bg-elevated/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        <Link href={`/courses/${course.slug}`} target="_blank" className="hover:text-cyan-400">
                          {course.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-bg-elevated border border-border">
                          {course.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-muted">
                        {course.duration} • {course.lessons} bài
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${course.price === "free" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"}`}>
                          {course.price === "free" ? "Miễn phí" : "Chuyên sâu"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-cyan-400"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id, course.title)}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Roadmap Manager */}
      {activeTab === "roadmap" && (
        <div className="bg-bg-panel border border-border rounded-2xl p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Lộ Trình Học Tập Đang Quản Lý ({roadmapTracks.length})
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Các lộ trình hiển thị tương tác cho Sinh viên tại trang /roadmap
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/roadmap" target="_blank">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Xem Roadmap User
                </Link>
              </Button>
              <Button variant="primary" size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <Link href="/admin/roadmap">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Mở Trình Quản Lý Lộ Trình
                </Link>
              </Button>
            </div>
          </div>

          {roadmapTracks.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-xl bg-bg-elevated/30">
              <p className="text-text-muted text-xs mb-4">Chưa có lộ trình học tập nào được tạo.</p>
              <Button variant="primary" size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/admin/roadmap">Thiết lập lộ trình mới</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {roadmapTracks.map((track) => (
                <div key={track.id} className="p-4 rounded-xl bg-bg-elevated/50 border border-border flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-text-primary text-sm mb-1">{track.title}</h3>
                    <p className="text-xs text-text-muted">
                      {track.steps.length} mốc kỹ năng • {track.targetRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href="/admin/roadmap">Chỉnh sửa</Link>
                    </Button>
                    <button
                      onClick={() => handleDeleteTrack(track.id, track.title)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
