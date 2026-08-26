/**
 * Embedded-AIoT Lab - Technical Tutorials & Knowledge Base Types
 * Dữ liệu chuyên đề và bài viết được quản lý động 100% trong Cơ Sở Dữ Liệu SQLite (Prisma ORM)
 */

export interface TutorialPost {
  slug: string;
  title: string;
  order: number;
  readTime: string;
  updatedAt: string;
  summary: string;
  contentHtml: string;
  codeSnippet?: {
    code: string;
    language: string;
    filename: string;
  };
  tags?: string[];
}

export interface TutorialTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  icon: string;
  badge?: string;
  level: string;
  description: string;
  totalArticles: number;
  author: string;
  authorTitle?: string;
  authorAvatar?: string;
  coverImage?: string;
  posts: TutorialPost[];
}

// Mảng khởi tạo rỗng - Dữ liệu thực tế được nạp hoàn toàn từ Database SQLite qua /api/tutorials
export const TUTORIAL_TOPICS: TutorialTopic[] = [];
