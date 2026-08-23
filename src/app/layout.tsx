import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "EMBEDDED-AIOT | Electronics of PTIT - Lab Hệ Thống Nhúng & AIoT",
    template: "%s | EMBEDDED-AIOT (Electronics of PTIT)",
  },
  description:
    "Trang thông tin, nghiên cứu và khóa học chuyên sâu của Embedded-AIoT Lab - Khoa Điện Tử 1, Học viện Công nghệ Bưu chính Viễn thông (PTIT). Chuyên sâu: STM32, ESP32, Zephyr RTOS, Edge AI, FPGA, RF/EMC.",
  keywords: [
    "embedded",
    "aiot",
    "ptit",
    "electronics of ptit",
    "khoa dien tu ptit",
    "firmware",
    "stm32",
    "esp32",
    "zephyr rtos",
    "freertos",
    "fpga",
    "verilog",
    "rf emc",
    "vna",
    "tinyml",
  ],
  authors: [{ name: "Embedded-AIoT Lab (Khoa Điện Tử PTIT)" }],
  creator: "Embedded-AIoT Lab PTIT",
  publisher: "Khoa Điện Tử 1 - Học viện Công nghệ Bưu chính Viễn thông",
  robots: "index, follow",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteConfig.url,
    siteName: "EMBEDDED-AIOT · Electronics of PTIT",
    title: "EMBEDDED-AIOT | Electronics of PTIT - Lab Hệ Thống Nhúng & AIoT",
    description:
      "Nghiên cứu & Đào tạo chuyên sâu: Embedded Systems, Edge AI, FPGA và Kỹ thuật Phần cứng RF/EMC tại PTIT.",
    images: [
      {
        url: "/images/logo.png",
        width: 800,
        height: 800,
        alt: "Logo EMBEDDED-AIOT Electronics of PTIT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EMBEDDED-AIOT | Electronics of PTIT",
    description: "Lab Hệ Thống Nhúng & AIoT - Khoa Điện Tử 1 PTIT",
    images: ["/images/logo.png"],
    creator: "@ptit_embedded",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary bg-grid-pattern selection:bg-accent/30 selection:text-white">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}