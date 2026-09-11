"use client";

import { safeStorage } from "./storage";
import { UserRole } from "@/context/AuthContext";

export type CategoryId = "embedded-mcu" | "aiot-edge" | "hardware-pcb" | "qa-projects" | "f17-b9";

export interface DiscussionCategory {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  {
    id: "embedded-mcu",
    name: "Vi Điều Khiển & Firmware",
    shortName: "MCU & Firmware",
    description: "STM32, ESP32, ARM Cortex-M, FreeRTOS, Zephyr, Bare-metal & Embedded Linux",
    icon: "⚡",
    color: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "aiot-edge",
    name: "AIoT & Edge AI",
    shortName: "AIoT & Edge AI",
    description: "TinyML, Edge Impulse, Thị giác máy tính, ROS2, Jetson Nano, NPU On-Device",
    icon: "🧠",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "hardware-pcb",
    name: "Phần Cứng & Thiết Kế PCB",
    shortName: "Hardware & PCB",
    description: "Altium Designer, KiCad, Mạch cao tốc, RF/Antenna, Nguồn xung, Tiêu chuẩn EMC/EMI",
    icon: "🔌",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "qa-projects",
    name: "Đồ Án, Dự Án & Hợp Tác",
    shortName: "Dự Án & Hợp Tác",
    description: "Hỏi đáp đồ án kỹ thuật, dự án mở cá nhân & nhóm, tìm đồng đội hợp tác nghiên cứu & phát triển",
    icon: "🎓",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "f17-b9",
    name: "F17 - Chuyện Trò Kỹ Thuật",
    shortName: "Chuyện Trò & Đời Sống",
    description: "Giao lưu cộng đồng kỹ sư nhúng, tâm sự chuyện nghề, kinh nghiệm phỏng vấn và phát triển sự nghiệp",
    icon: "☕",
    color: "from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30",
  },
];

export type FlairType = "hoi-dap" | "chia-se" | "do-an" | "thao-luan" | "debug" | "tuyen-dung";

export interface DiscussionFlair {
  id: FlairType;
  label: string;
  prefix: string; // VOZ prefix style e.g. [Hỏi đáp]
  badgeClass: string;
}

export const DISCUSSION_FLAIRS: Record<FlairType, DiscussionFlair> = {
  "hoi-dap": {
    id: "hoi-dap",
    label: "Hỏi đáp",
    prefix: "[Hỏi đáp]",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  "chia-se": {
    id: "chia-se",
    label: "Chia sẻ",
    prefix: "[Chia sẻ]",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  "do-an": {
    id: "do-an",
    label: "Đồ án / Dự án",
    prefix: "[Project]",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  "thao-luan": {
    id: "thao-luan",
    label: "Thảo luận",
    prefix: "[Thảo luận]",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  debug: {
    id: "debug",
    label: "Báo lỗi / Debug",
    prefix: "[Debug]",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  "tuyen-dung": {
    id: "tuyen-dung",
    label: "Tuyển thành viên",
    prefix: "[Tìm đồng đội]",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
};

export type VozReactionType = "ung" | "gach" | "ung_bung" | "haha" | "nguong_mo";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: "image" | "document" | "code" | "archive" | "other";
  dataUrl: string;
}

export interface DiscussionComment {
  id: string;
  threadId: string;
  parentId?: string;
  author: string;
  authorId: string;
  authorRole?: UserRole;
  authorAvatar?: string;
  authorTitle?: string;
  content: string;
  quoteContent?: string;
  quoteAuthor?: string;
  attachedFiles?: AttachedFile[];
  votes: number;
  userVote?: 1 | -1 | 0;
  reactions: {
    ung: number;
    gach: number;
    ung_bung: number;
  };
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  category?: CategoryId;
  flair: FlairType;
  author: string;
  authorId: string;
  authorRole?: UserRole;
  authorAvatar?: string;
  authorTitle?: string;
  content: string;
  codeSnippet?: string;
  attachedFiles?: AttachedFile[];
  hasSimulatorPreview?: boolean;
  simulatorCode?: string;
  votes: number;
  userVote?: 1 | -1 | 0;
  viewsCount: number;
  repliesCount: number;
  reactions: {
    ung: number;
    gach: number;
    ung_bung: number;
    haha: number;
    nguong_mo: number;
  };
  userReactions?: VozReactionType[];
  isPinned?: boolean;
  createdAt: string;
  lastActivity: string;
  tags: string[];
}
const STORAGE_THREADS_KEY = "embedded_aiot_forum_threads_v4";
const STORAGE_COMMENTS_KEY = "embedded_aiot_forum_comments_v4";

// Database thật trống ban đầu - Không tự sinh bài viết giả lập
export const DEFAULT_THREADS: DiscussionThread[] = [];
export const DEFAULT_COMMENTS: DiscussionComment[] = [];

// ============================================
// API CLIENT FUNCTIONS (Đồng bộ trực tiếp SQLite Database)
// ============================================

export async function fetchDiscussionThreadsApi(params?: {
  category?: string;
  flair?: string;
  search?: string;
  sort?: string;
}): Promise<DiscussionThread[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "all") searchParams.set("category", params.category);
    if (params?.flair && params.flair !== "all") searchParams.set("flair", params.flair);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort) searchParams.set("sort", params.sort);

    const query = searchParams.toString();
    const url = `/api/discussions${query ? `?${query}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      saveDiscussionThreads(json.data);
      return json.data;
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách thảo luận từ API:", error);
    return getDiscussionThreads();
  }
}

export async function fetchDiscussionThreadDetailApi(id: string): Promise<DiscussionThread | null> {
  try {
    const res = await fetch(`/api/discussions/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết bài viết từ API:", error);
    return getThreadById(id);
  }
}

export async function createDiscussionThreadApi(params: CreateThreadParams): Promise<DiscussionThread> {
  const res = await fetch("/api/discussions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Không thể tạo bài viết");
  }
  return json.data;
}

export async function deleteDiscussionThreadApi(threadId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/discussions/${threadId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      deleteDiscussionThread(threadId);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    return false;
  }
}

export async function voteDiscussionThreadApi(threadId: string, diff: number): Promise<{ votes: number } | null> {
  try {
    const res = await fetch(`/api/discussions/${threadId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diff }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi vote bài viết:", error);
    return null;
  }
}

export async function reactDiscussionThreadApi(
  threadId: string,
  reaction: VozReactionType,
  action: "add" | "remove"
): Promise<{ reactions: any } | null> {
  try {
    const res = await fetch(`/api/discussions/${threadId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction, action }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (error) {
    console.error("Lỗi khi react bài viết:", error);
    return null;
  }
}

export async function incrementThreadViewsApi(threadId: string): Promise<void> {
  try {
    await fetch(`/api/discussions/${threadId}/view`, {
      method: "POST",
    });
  } catch (error) {
    // Silent fail
  }
}

export async function createDiscussionCommentApi(params: CreateCommentParams): Promise<DiscussionComment> {
  const res = await fetch(`/api/discussions/${params.threadId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Không thể gửi bình luận");
  }
  return json.data;
}

export async function deleteDiscussionCommentApi(threadId: string, commentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/discussions/${threadId}/comments/${commentId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (error) {
    console.error("Lỗi khi xóa bình luận:", error);
    return false;
  }
}


export function getDiscussionThreads(): DiscussionThread[] {
  if (typeof window === "undefined") return DEFAULT_THREADS;
  try {
    const data = safeStorage.getItem(STORAGE_THREADS_KEY);
    if (!data) {
      safeStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(DEFAULT_THREADS));
      return DEFAULT_THREADS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_THREADS;
  }
}

export function saveDiscussionThreads(threads: DiscussionThread[]): void {
  if (typeof window === "undefined") return;
  safeStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
}

export function getDiscussionComments(threadId?: string): DiscussionComment[] {
  if (typeof window === "undefined") return DEFAULT_COMMENTS;
  try {
    const data = safeStorage.getItem(STORAGE_COMMENTS_KEY);
    const comments: DiscussionComment[] = data ? JSON.parse(data) : DEFAULT_COMMENTS;
    if (threadId) {
      return comments.filter((c) => c.threadId === threadId);
    }
    return comments;
  } catch {
    return DEFAULT_COMMENTS;
  }
}

export function saveDiscussionComments(comments: DiscussionComment[]): void {
  if (typeof window === "undefined") return;
  safeStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
}

export function getThreadById(id: string): DiscussionThread | null {
  const threads = getDiscussionThreads();
  return threads.find((t) => t.id === id) || null;
}

export function incrementThreadViews(threadId: string): void {
  const threads = getDiscussionThreads();
  const updated = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, viewsCount: t.viewsCount + 1 };
    }
    return t;
  });
  saveDiscussionThreads(updated);
}

export interface CreateThreadParams {
  title: string;
  category?: CategoryId;
  flair: FlairType;
  content: string;
  codeSnippet?: string;
  attachedFiles?: AttachedFile[];
  hasSimulatorPreview?: boolean;
  simulatorCode?: string;
  tags?: string[];
  author: {
    id: string;
    name: string;
    role?: UserRole;
    avatar?: string;
    bio?: string;
  };
}

export function createDiscussionThread(params: CreateThreadParams): DiscussionThread {
  const threads = getDiscussionThreads();
  const id = `thread-${Date.now()}`;
  const now = new Date().toISOString();

  let authorTitle = "Thành viên";
  if (params.author.role === "superadmin") authorTitle = "Quản trị viên";
  else if (params.author.role === "admin") authorTitle = "Điều hành viên";
  else if (params.author.role === "lab_member") authorTitle = "Thành viên tích cực";
  else authorTitle = "Thành viên";

  const newThread: DiscussionThread = {
    id,
    title: params.title.trim(),
    category: params.category || "embedded-mcu",
    flair: params.flair,
    author: params.author.name,
    authorId: params.author.id,
    authorRole: params.author.role,
    authorAvatar: params.author.avatar || "👤",
    authorTitle,
    content: params.content.trim(),
    codeSnippet: params.codeSnippet?.trim() || undefined,
    attachedFiles: params.attachedFiles || [],
    hasSimulatorPreview: Boolean(params.hasSimulatorPreview),
    simulatorCode: params.simulatorCode,
    votes: 1,
    userVote: 1,
    viewsCount: 1,
    repliesCount: 0,
    reactions: {
      ung: 1,
      gach: 0,
      ung_bung: 0,
      haha: 0,
      nguong_mo: 0,
    },
    userReactions: ["ung"],
    isPinned: false,
    createdAt: now,
    lastActivity: now,
    tags: params.tags && params.tags.length > 0 ? params.tags : ["thao-luan"],
  };

  const updated = [newThread, ...threads];
  saveDiscussionThreads(updated);
  return newThread;
}

export function voteDiscussionThread(threadId: string, direction: 1 | -1): DiscussionThread | null {
  const threads = getDiscussionThreads();
  let updatedThread: DiscussionThread | null = null;

  const updated = threads.map((t) => {
    if (t.id === threadId) {
      const currentVote = t.userVote || 0;
      let newVote: 1 | -1 | 0 = direction;
      let diff = 0;

      if (currentVote === direction) {
        newVote = 0;
        diff = -direction;
      } else if (currentVote === 0) {
        diff = direction;
      } else {
        diff = direction * 2;
      }

      updatedThread = {
        ...t,
        votes: t.votes + diff,
        userVote: newVote,
      };
      return updatedThread;
    }
    return t;
  });

  saveDiscussionThreads(updated);
  return updatedThread;
}

export function reactDiscussionThread(threadId: string, reaction: VozReactionType): DiscussionThread | null {
  const threads = getDiscussionThreads();
  let updatedThread: DiscussionThread | null = null;

  const updated = threads.map((t) => {
    if (t.id === threadId) {
      const userReactions = [...(t.userReactions || [])];
      const reactions = { ...t.reactions };

      const hasReacted = userReactions.includes(reaction);
      if (hasReacted) {
        reactions[reaction] = Math.max(0, reactions[reaction] - 1);
        const filtered = userReactions.filter((r) => r !== reaction);
        updatedThread = { ...t, reactions, userReactions: filtered };
      } else {
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        updatedThread = { ...t, reactions, userReactions: [...userReactions, reaction] };
      }
      return updatedThread;
    }
    return t;
  });

  saveDiscussionThreads(updated);
  return updatedThread;
}

export interface CreateCommentParams {
  threadId: string;
  content: string;
  quoteContent?: string;
  quoteAuthor?: string;
  author: {
    id: string;
    name: string;
    role?: UserRole;
    avatar?: string;
  };
}

export function createDiscussionComment(params: CreateCommentParams): DiscussionComment {
  const comments = getDiscussionComments();
  const threads = getDiscussionThreads();
  const id = `comment-${Date.now()}`;
  const now = new Date().toISOString();

  let authorTitle = "Thành viên";
  if (params.author.role === "superadmin") authorTitle = "Quản trị viên";
  else if (params.author.role === "admin") authorTitle = "Điều hành viên";
  else if (params.author.role === "lab_member") authorTitle = "Thành viên tích cực";

  const newComment: DiscussionComment = {
    id,
    threadId: params.threadId,
    author: params.author.name,
    authorId: params.author.id,
    authorRole: params.author.role,
    authorAvatar: params.author.avatar || "👤",
    authorTitle,
    content: params.content.trim(),
    quoteContent: params.quoteContent,
    quoteAuthor: params.quoteAuthor,
    votes: 0,
    userVote: 0,
    reactions: { ung: 0, gach: 0, ung_bung: 0 },
    createdAt: now,
  };

  const updatedComments = [...comments, newComment];
  saveDiscussionComments(updatedComments);

  const updatedThreads = threads.map((t) => {
    if (t.id === params.threadId) {
      return {
        ...t,
        repliesCount: t.repliesCount + 1,
        lastActivity: now,
      };
    }
    return t;
  });
  saveDiscussionThreads(updatedThreads);

  return newComment;
}

export function deleteDiscussionThread(threadId: string): boolean {
  const threads = getDiscussionThreads();
  const filteredThreads = threads.filter((t) => t.id !== threadId);
  if (filteredThreads.length === threads.length) return false;

  saveDiscussionThreads(filteredThreads);

  // Xóa luôn các bình luận thuộc về thread này
  const comments = getDiscussionComments();
  const filteredComments = comments.filter((c) => c.threadId !== threadId);
  saveDiscussionComments(filteredComments);

  return true;
}

export function deleteDiscussionComment(commentId: string): boolean {
  const comments = getDiscussionComments();
  const targetComment = comments.find((c) => c.id === commentId);
  if (!targetComment) return false;

  const filteredComments = comments.filter((c) => c.id !== commentId);
  saveDiscussionComments(filteredComments);

  // Giảm số repliesCount của thread
  const threads = getDiscussionThreads();
  const updatedThreads = threads.map((t) => {
    if (t.id === targetComment.threadId) {
      return {
        ...t,
        repliesCount: Math.max(0, t.repliesCount - 1),
      };
    }
    return t;
  });
  saveDiscussionThreads(updatedThreads);

  return true;
}

export function resetDiscussionData(): DiscussionThread[] {
  if (typeof window === "undefined") return DEFAULT_THREADS;
  safeStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(DEFAULT_THREADS));
  safeStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(DEFAULT_COMMENTS));
  return DEFAULT_THREADS;
}
