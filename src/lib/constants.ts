export const siteConfig = {
  name: "EMBEDDED-AIOT",
  subName: "Electronics of PTIT",
  fullName: "Embedded-AIoT Lab | Electronics of PTIT",
  university: "Posts and Telecommunications Institute of Technology (PTIT)",
  faculty: "Faculty of Electronics Engineering 1 (Khoa Điện Tử 1 - PTIT)",
  description:
    "Embedded-AIoT Lab (Khoa Điện Tử - PTIT): Nghiên cứu và đào tạo chuyên sâu về Embedded Systems, AIoT, Edge AI, FPGA/ASIC và Kỹ thuật Phần cứng RF/EMC.",
  url: "https://embedded-aiot.ptit.edu.vn",
  logo: "/images/logo.png",
  ogImage: "/images/logo.png",
  author: "Embedded-AIoT Lab PTIT",
  authorTitle: "Embedded Systems & AIoT Research Group",
  twitter: "https://twitter.com/ptit_embedded",
  github: "https://github.com/embedded-aiot-ptit",
  linkedin: "https://linkedin.com/school/ptit",
  facebook: "https://facebook.com/dientu1.ptit",
  email: "embedded.aiot@ptit.edu.vn",
  location: "Hà Nội, Việt Nam",
  navItems: [
    { label: "Trang chủ", href: "/" },
    {
      label: "Học tập",
      href: "/tutorials",
      items: [
        {
          label: "Chuyên đề",
          href: "/tutorials",
          description: "Thư viện bài giảng & chuyên đề kỹ thuật chuyên sâu",
          icon: "BookOpen",
          badge: "24+ bài",
        },
        {
          label: "Khóa học",
          href: "/courses",
          description: "Các khóa học thực hành và dự án thực tế",
          icon: "GraduationCap",
          badge: "Thực hành",
        },
        {
          label: "Lộ trình học",
          href: "/roadmap",
          description: "Lộ trình phát triển kỹ sư Embedded & AIoT R&D",
          icon: "Route",
          badge: "Chuẩn R&D",
        },
      ],
    },
    { label: "Nghiên cứu", href: "/research" },
    { label: "Mô phỏng", href: "/tools/stm32-simulator" },
    { label: "Bản tin", href: "/blog" },
    { label: "Xếp hạng", href: "/ranking" },
  ],
};

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export interface NavItem {
  label: string;
  href: string;
  items?: NavSubItem[];
}

export type SiteConfig = typeof siteConfig;
