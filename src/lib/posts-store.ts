"use client";

import { BlogPostData, BlogPostType } from "@/lib/content";
import { safeStorage } from "./storage";
export type { BlogPostType };

export interface PostComment {
  id: string;
  postId: string;
  author: string;
  authorRole?: string;
  content: string;
  createdAt: string;
}

export const POST_TYPE_META: Record<BlogPostType, { label: string; icon: string; badgeColor: string }> = {
  recruitment: {
    label: "Tuyển thành viên",
    icon: "📢",
    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  daily: {
    label: "Nhật ký Lab",
    icon: "🔬",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  technical: {
    label: "Chia sẻ Kỹ thuật",
    icon: "⚡",
    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  event: {
    label: "Sự kiện & Workshop",
    icon: "🏆",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  general: {
    label: "Thông báo chung",
    icon: "📌",
    badgeColor: "bg-accent/15 text-accent border-accent/30",
  },
};

export const DEFAULT_LAB_FANPAGE_POSTS: BlogPostData[] = [
  {
    _id: "post-recruitment-gen-2026",
    title: "📢 [THÔNG BÁO CHÍNH THỨC] MỞ ĐƠN TUYỂN THÀNH VIÊN & CỘNG TÁC VIÊN NGHIÊN CỨU GEN MỚI - EMBEDDED-AIOT LAB (KHOA ĐIỆN TỬ 1 PTIT)",
    slug: "thong-bao-tuyen-thanh-vien-gen-moi-embedded-aiot-lab",
    date: "2026-08-24",
    postType: "recruitment",
    pinned: true,
    likesCount: 142,
    commentsCount: 28,
    tags: ["tuyen-thanh-vien", "ptit", "embedded", "aiot", "nckh"],
    featured: true,
    draft: false,
    readingTime: 4,
    author: "Embedded-AIoT Lab PTIT",
    authorTitle: "Ban Chủ Nhiệm Phòng Lab",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    images: [
      "/images/logo.png"
    ],
    excerpt: "Embedded-AIoT Lab chính thức mở đơn tuyển thành viên thế hệ mới dành cho sinh viên Khoa Điện Tử 1 & PTIT đam mê Hệ thống nhúng, Linux, TinyML, FPGA và Thiết kế Mạch in Cao tốc!",
    url: "/blog/thong-bao-tuyen-thanh-vien-gen-moi-embedded-aiot-lab",
    body: {
      raw: `## 🚀 Về Embedded-AIoT Lab - Khoa Điện Tử 1 PTIT
Phòng thí nghiệm **Embedded-AIoT Lab** trực thuộc Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông là môi trường nghiên cứu & đào tạo chuyên sâu về:
1. **Embedded Systems & RTOS**: STM32, Zephyr RTOS, FreeRTOS, ESP32, Kiến trúc Firmware.
2. **Embedded Linux**: Kernel Driver, Yocto Project, BSP, Raspberry Pi / NXP i.MX.
3. **TinyML & Edge AI**: Lượng tử hóa mô hình INT8, ESP32-S3 Vector ESP-DL, TensorFlow Lite Micro.
4. **FPGA & ASIC**: Thiết kế vi mạch số bằng Verilog HDL, CPU RISC-V 32-bit trên Xilinx Vivado.
5. **High-Speed PCB & RF**: Thiết kế mạch in 50Ω với Altium Designer, đo kiểm EMC & VNA Smith Chart.

---

## 🎯 Quyền Lợi Khi Tham Gia Lab:
* Được **làm việc trực tiếp trên thiết bị mạch thật** tại Sân B9 (Máy hiện sóng, VNA, Máy phân tích phổ, Bộ nạp JTAG Segger, Kit phát triển STM32 / ESP32-S3 / FPGA Zynq).
* Được sự **hướng dẫn 1-1** từ các Thầy Cô giảng viên và các anh chị Kỹ sư nghiên cứu khóa trước.
* Cơ hội tham gia các **Đề tài Nghiên cứu Khoa học sinh viên**, Cuộc thi Sáng tạo Kỹ thuật và đồ án tốt nghiệp xuất sắc.
* Rèn luyện tác phong làm việc chuẩn R&D công nghiệp: Git flow, Clean code, Unit testing và Báo cáo chuyên đề.

---

## 📋 Yêu Cầu & Đối Tượng Tuyển:
* Sinh viên các khóa D22, D23, D24, D25 thuộc Học viện (Ưu tiên các ngành Kỹ thuật Điện tử, IoT, CNTT, Viễn thông).
* Có tinh thần **chủ động, kiên trì, đam mê tìm hiểu phần cứng và lập trình nhúng**.
* Cam kết dành tối thiểu 10 - 15 giờ/tuần sinh hoạt và làm việc tại phòng Lab.

👉 **Link Đăng ký phỏng vấn online:** [https://www.facebook.com/EmbeddedAIoTLAB](https://www.facebook.com/EmbeddedAIoTLAB)
📍 **Địa điểm Lab:** Sân B9 - Khoa Điện Tử 1, Học viện Công nghệ Bưu chính Viễn thông (Cơ sở Hà Đông).`,
    },
  },
  {
    _id: "post-daily-lab-test-stm32",
    title: "🔬 [NHẬT KÝ BÀN ĐO] Buổi Thực Nghiệm Bắn Mạch & Kiểm Tra Ngắt DMA Trên Bo STM32G4 Kết Hợp Zephyr RTOS",
    slug: "nhat-ky-ban-do-thuc-nghiem-stm32g4-zephyr-rtos",
    date: "2026-08-23",
    postType: "daily",
    pinned: false,
    likesCount: 89,
    commentsCount: 12,
    tags: ["nhat-ky-lab", "stm32", "zephyr", "dma", "bando"],
    featured: false,
    draft: false,
    readingTime: 3,
    author: "Nhóm Nghiên Cứu Firmware",
    authorTitle: "Kỹ sư Thực nghiệm Lab",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Hôm nay các bạn sinh viên Lab đã hoàn thành việc đo đạc dạng sóng xung ngắt UART DMA trên máy hiện sóng Rigol và chạy thử bản build Zephyr RTOS đa luồng đầu tiên!",
    url: "/blog/nhat-ky-ban-do-thuc-nghiem-stm32g4-zephyr-rtos",
    body: {
      raw: `Chiều nay tại Sân B9, nhóm nghiên cứu Firmware Lab vừa hoàn thành buổi thực nghiệm kiểm chứng driver UART Circular RingBuffer kết hợp DMA Idle Line Detection trên chip STM32G474.

### Một số kết quả đo đạc:
* **Tải CPU:** Giảm từ 42% xuống dưới 3.5% khi truyền nhận dữ liệu tốc độ cao 921600 baud.
* **Thời gian đáp ứng ngắt:** Đo bằng Logic Analyzer đạt dưới 1.2 micro giây.
* Chạy ổn định trên Kernel **Zephyr RTOS v3.7** với bộ quản lý luồng Semaphore đồng bộ.

Mỗi tuần một đề tài thực chiến! Chúc mừng các bạn thành viên đã hoàn thành xuất sắc mục tiêu milestone tuần này! 🎉`,
    },
  },
  {
    _id: "post-tech-tinyml-yolov8",
    title: "⚡ [CHIA SẺ KỸ THUẬT] Pipeline Lượng Tử Hóa INT8 & Nhúng Mô Hình YOLOv8 Lên ESP32-S3 Với Khung ESP-DL",
    slug: "chia-se-ky-thuat-pipeline-tinyml-esp32-s3-esp-dl",
    date: "2026-08-20",
    postType: "technical",
    pinned: false,
    likesCount: 165,
    commentsCount: 34,
    tags: ["chia-se-ky-thuat", "tinyml", "esp32-s3", "esp-dl", "aiot"],
    featured: true,
    draft: false,
    readingTime: 5,
    author: "Lab Research Team",
    authorTitle: "TinyML Group",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Chia sẻ toàn bộ mã nguồn và quy trình chuyển đổi model YOLOv8 Nano từ PyTorch sang ESP-DL tận dụng tập lệnh Vector PIE của ESP32-S3, tốc độ suy luận ~14.2ms.",
    url: "/blog/chia-se-ky-thuat-pipeline-tinyml-esp32-s3-esp-dl",
    body: {
      raw: `## Quy Trình Triển Khai TinyML Trên ESP32-S3
Khi chạy Deep Learning trên vi điều khiển có bộ nhớ hạn chế (512KB SRAM), kỹ thuật lượng tử hóa **Post-Training Quantization (PTQ) INT8** là chìa khóa sống còn giúp:
* Giảm dung lượng trọng số mô hình từ **12MB (Float32)** xuống chỉ còn **3.1MB (INT8)**.
* Tăng tốc độ tính toán hơn **3.8 lần** nhờ tập lệnh Vector SIMD 128-bit trên lõi kép Xtensa LX7 của ESP32-S3.

Mã nguồn mẫu và file cấu hình đã được upload lên GitHub Lab:
👉 [https://github.com/embedded-aiot-ptit](https://github.com/embedded-aiot-ptit)`,
    },
  },
  {
    _id: "post-event-nckh-giai-nhat",
    title: "🏆 [CHÚC MỪNG] Đội Tuyển Sinh Viên Embedded-AIoT Lab Đạt Giải Nhất Nghiên Cứu Khoa Học Cấp Học Viện 2026",
    slug: "chuc-mung-sinh-vien-lab-dat-giai-nhat-nckh-2026",
    date: "2026-08-15",
    postType: "event",
    pinned: false,
    likesCount: 240,
    commentsCount: 45,
    tags: ["su-kien", "thanh-tich", "nckh-ptit", "dientu1"],
    featured: false,
    draft: false,
    readingTime: 3,
    author: "Embedded-AIoT Lab PTIT",
    authorTitle: "Ban Truyền Thông Lab",
    facebookPostUrl: "https://www.facebook.com/EmbeddedAIoTLAB",
    excerpt: "Đề tài 'Hệ thống Smart Camera AIoT nhận diện bất thường thời gian thực trên bo mạch vi xử lý lai FPGA-NPU' do nhóm sinh viên Lab thực hiện đã xuất sắc đạt Giải Nhất!",
    url: "/blog/chuc-mung-sinh-vien-lab-dat-giai-nhat-nckh-2026",
    body: {
      raw: `Xin chúc mừng nhóm nghiên cứu sinh viên Khoa Điện Tử 1 tại Embedded-AIoT Lab đã xuất sắc giành **Giải Nhất Hội Nghị Nghiên Cứu Khoa Học Sinh Viên Cấp Học Viện** năm 2026!

Đề tài được hội đồng giám khảo đánh giá rất cao nhờ tính thực tiễn:
1. Tự thiết kế toàn bộ bo mạch phần cứng 4 lớp kiểm soát trở kháng 50Ω.
2. Tích hợp mô hình Edge AI chạy trực tiếp trên chip tăng tốc phần cứng không phụ thuộc internet.
3. Độ trễ phát hiện cảnh báo dưới 20 mili-giây.

Cảm ơn sự hướng dẫn tận tình của các Thầy Cô Khoa Điện Tử 1 và nỗ lực không ngừng nghỉ suốt 6 tháng qua của các bạn thành viên! 💐🎉`,
    },
  },
];

const STORAGE_KEY = "embedded_lab_dynamic_posts";
const LIKES_STORAGE_KEY = "embedded_lab_user_likes";
const COMMENTS_STORAGE_KEY = "embedded_lab_user_comments";

// Helper to get posts safely on client & server
export function getStoredPosts(): BlogPostData[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BlogPostData[];
  } catch (error) {
    console.error("Error reading stored posts:", error);
    return [];
  }
}

export function saveStoredPosts(posts: BlogPostData[]): void {
  if (typeof window === "undefined") return;
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent("embedded_posts_updated", { detail: posts }));
  } catch (error) {
    console.error("Error saving stored posts:", error);
  }
}

export function getAllPosts(): BlogPostData[] {
  return getStoredPosts();
}

export function getPostBySlug(slug: string): BlogPostData | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

export function createPost(postData: Omit<BlogPostData, "_id" | "url">): BlogPostData {
  const posts = getStoredPosts();
  const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const slug = postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newPost: BlogPostData = {
    ...postData,
    _id: id,
    slug,
    url: `/blog/${slug}`,
    date: postData.date || new Date().toISOString().split("T")[0],
    postType: postData.postType || "daily",
    likesCount: postData.likesCount || 1,
    commentsCount: postData.commentsCount || 0,
    images: postData.images || [],
  };

  const updated = [newPost, ...posts];
  saveStoredPosts(updated);
  return newPost;
}

export function updatePost(id: string, updates: Partial<BlogPostData>): BlogPostData | null {
  const posts = getStoredPosts();
  const index = posts.findIndex((p) => p._id === id);
  if (index === -1) return null;

  const existing = posts[index];
  const slug = updates.slug || existing.slug;
  const updatedPost: BlogPostData = {
    ...existing,
    ...updates,
    slug,
    url: `/blog/${slug}`,
    updated: new Date().toISOString().split("T")[0],
  };

  posts[index] = updatedPost;
  saveStoredPosts(posts);
  return updatedPost;
}

export function deletePost(id: string): boolean {
  const posts = getStoredPosts();
  const filtered = posts.filter((p) => p._id !== id);
  if (filtered.length === posts.length) return false;
  saveStoredPosts(filtered);
  return true;
}

export function getPostsByTag(tag: string): BlogPostData[] {
  const cleanTag = tag.toLowerCase().trim();
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === cleanTag)
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

// Like functionality
export function toggleLikePost(postId: string): { isLiked: boolean; count: number } {
  if (typeof window === "undefined") return { isLiked: false, count: 0 };
  try {
    const rawLikes = safeStorage.getItem(LIKES_STORAGE_KEY) || "[]";
    let likedList: string[] = JSON.parse(rawLikes);
    const isAlreadyLiked = likedList.includes(postId);

    const posts = getStoredPosts();
    const postIndex = posts.findIndex((p) => p._id === postId);

    let newCount = postIndex !== -1 ? posts[postIndex].likesCount || 0 : 0;

    if (isAlreadyLiked) {
      likedList = likedList.filter((id) => id !== postId);
      newCount = Math.max(0, newCount - 1);
    } else {
      likedList.push(postId);
      newCount = newCount + 1;
    }

    if (postIndex !== -1) {
      posts[postIndex].likesCount = newCount;
      saveStoredPosts(posts);
    }

    safeStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedList));
    return { isLiked: !isAlreadyLiked, count: newCount };
  } catch (err) {
    console.error("Error toggling like:", err);
    return { isLiked: false, count: 0 };
  }
}

export function isPostLikedByUser(postId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const rawLikes = safeStorage.getItem(LIKES_STORAGE_KEY) || "[]";
    const likedList: string[] = JSON.parse(rawLikes);
    return likedList.includes(postId);
  } catch {
    return false;
  }
}

// Comments storage
export function getPostComments(postId: string): PostComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeStorage.getItem(`${COMMENTS_STORAGE_KEY}_${postId}`);
    if (!raw) return [];
    return JSON.parse(raw) as PostComment[];
  } catch {
    return [];
  }
}

export function addPostComment(postId: string, author: string, content: string, authorRole?: string): PostComment {
  const comments = getPostComments(postId);
  const newComment: PostComment = {
    id: `cmt_${Date.now()}`,
    postId,
    author: author || "Sinh viên PTIT",
    authorRole: authorRole || "Thành viên",
    content,
    createdAt: new Date().toLocaleString("vi-VN"),
  };
  const updated = [...comments, newComment];
  if (typeof window !== "undefined") {
    safeStorage.setItem(`${COMMENTS_STORAGE_KEY}_${postId}`, JSON.stringify(updated));

    // increment count in post
    const posts = getStoredPosts();
    const idx = posts.findIndex((p) => p._id === postId);
    if (idx !== -1) {
      posts[idx].commentsCount = updated.length;
      saveStoredPosts(posts);
    }
  }
  return newComment;
}
