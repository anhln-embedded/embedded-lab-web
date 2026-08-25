// Embedded-AIoT Lab (Electronics of PTIT) Content Layer
// Complete technical data layer with 10 lab articles, 4 courses, 8 field atlas topics

export type BlogPostType = "recruitment" | "daily" | "technical" | "event" | "general";

export interface BlogPostData {
  _id: string;
  title: string;
  slug: string;
  date: string;
  updated?: string;
  tags: string[];
  postType?: BlogPostType;
  pinned?: boolean;
  likesCount?: number;
  commentsCount?: number;
  images?: string[];
  facebookPostUrl?: string;
  series?: string;
  seriesOrder?: number;
  coverImage?: string;
  coverAlt?: string;
  excerpt: string;
  author: string;
  authorTitle?: string;
  authorAvatar?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  draft: boolean;
  readingTime: number;
  url: string;
  contentHtml?: string;
  body: { raw: string; code?: string };
}

export interface LessonData {
  title: string;
  slug: string;
  duration: string;
  free: boolean;
  summary?: string;
  codeSnippet?: string;
  videoUrl?: string;
  contentHtml?: string;
}

export interface CourseModule {
  module: string;
  lessons: LessonData[];
}

export type CourseCategory =
  | "embedded-rtos"
  | "embedded-linux"
  | "tinyml"
  | "fpga"
  | "pcb-hardware";

export interface CourseData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: CourseCategory;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  prerequisites: string[];
  tags: string[];
  price: "free" | "paid";
  thumbnail?: string;
  githubRepo?: string;
  instructor?: string;
  featured?: boolean;
  curriculum: CourseModule[];
  url: string;
  body: { raw: string; code?: string };
}

export interface AtlasResource {
  title: string;
  url: string;
  type: "article" | "tool" | "video" | "book" | "datasheet";
  description?: string;
}

export interface AtlasTopicData {
  _id: string;
  title: string;
  slug: string;
  category: "rf" | "fpga" | "embedded" | "aiot" | "tools";
  description: string;
  learningPath?: string[];
  relatedTopics: string[];
  resources: AtlasResource[];
  url: string;
  body: { raw: string; code?: string };
}

// 0 Initial Articles (Admin will manage dynamically)
export const allPosts: BlogPostData[] = [];

// 0 Initial Courses (Admin will manage dynamically)
export const allCourses: CourseData[] = [];
// 0 Initial Atlas Topics
export const allAtlasTopics: AtlasTopicData[] = [];


// Helper functions
export function getPostBySlug(slug: string): BlogPostData | undefined {
  return allPosts.find((post) => post.slug === slug);
}

export function getCourseBySlug(slug: string): CourseData | undefined {
  return allCourses.find((course) => course.slug === slug);
}

export function getAtlasTopicBySlug(slug: string): AtlasTopicData | undefined {
  return allAtlasTopics.find((topic) => topic.slug === slug);
}

export function getPostsByTag(tag: string): BlogPostData[] {
  const cleanTag = tag.toLowerCase().trim();
  return allPosts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === cleanTag)
  );
}

export function getPostsBySeries(series: string): BlogPostData[] {
  return allPosts
    .filter((post) => post.series === series)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
}

export function getRelatedPosts(post: BlogPostData, limit = 3): BlogPostData[] {
  return allPosts
    .filter(
      (p) => p._id !== post._id && p.tags.some((tag) => post.tags.includes(tag))
    )
    .slice(0, limit);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  allPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getCategories(): { slug: string; name: string; count: number }[] {
  const categories = [
    { slug: "rf", name: "RF / EMC & Vi Ba", count: 0 },
    { slug: "embedded", name: "Embedded Systems & RTOS", count: 0 },
    { slug: "aiot", name: "AIoT / Edge AI", count: 0 },
    { slug: "fpga", name: "FPGA / HDL & RISC-V", count: 0 },
    { slug: "tools", name: "Tools, PCB & Debugging", count: 0 },
  ];

  allAtlasTopics.forEach((topic) => {
    const cat = categories.find((c) => c.slug === topic.category);
    if (cat) cat.count++;
  });

  return categories;
}