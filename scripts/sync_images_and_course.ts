import fs from "fs";
import path from "path";
import { parseSingleMarkdownArticle, pairBilingualMarkdownFiles } from "../src/lib/markdown-importer";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function uploadFile(filePath: string): Promise<string | null> {
  const filename = path.basename(filePath);
  const buffer = fs.readFileSync(filePath);

  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/svg+xml\r\n\r\n`;
  const suffix = `\r\n--${boundary}--\r\n`;

  const body = Buffer.concat([
    Buffer.from(prefix, "utf-8"),
    buffer,
    Buffer.from(suffix, "utf-8")
  ]);

  try {
    const res = await fetch("https://embedded-aiot.com/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "User-Agent": USER_AGENT,
      },
      body: body,
    });

    const json = await res.json();
    if (json.success && json.url) {
      return json.url;
    } else {
      console.warn(`Upload failed for ${filename}:`, json);
      return null;
    }
  } catch (err: any) {
    console.error(`Error uploading ${filename}:`, err.message);
    return null;
  }
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT },
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function main() {
  console.log("=== BẮT ĐẦU ĐỒNG BỘ HÌNH ẢNH LÊN PRODUCTION CLOUD ===");

  const imagesDir = "F:\\Advance_C\\stm32f103c8\\images";
  const allSvgFiles = fs.readdirSync(imagesDir).filter((f) => f.endsWith(".svg"));

  console.log(`Tìm thấy ${allSvgFiles.length} tệp SVG trong thư mục ảnh.`);

  const mapFile = "F:\\Advance_C\\stm32f103c8\\images_url_map.json";
  let urlMap: Record<string, string> = {};
  if (fs.existsSync(mapFile)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
      console.log(`Đã nạp ${Object.keys(urlMap).length} ảnh đã map từ cache.`);
    } catch {}
  }

  for (let i = 0; i < allSvgFiles.length; i++) {
    const f = allSvgFiles[i];
    if (urlMap[f]) {
      continue;
    }
    const fullPath = path.join(imagesDir, f);
    process.stdout.write(`[${i + 1}/${allSvgFiles.length}] Đang upload ${f} ... `);

    const uploadedUrl = await uploadFile(fullPath);
    if (uploadedUrl) {
      urlMap[f] = uploadedUrl;
      console.log(`-> OK: ${uploadedUrl}`);
    } else {
      console.log(`-> THẤT BẠI!`);
    }
  }
  fs.writeFileSync(mapFile, JSON.stringify(urlMap, null, 2), "utf-8");

  console.log("\nĐã sẵn sàng " + Object.keys(urlMap).length + " hình ảnh!");

  // Xác minh 1 số URL ngẫu nhiên
  const testFiles = ["bai02_gpio_structure.svg", "bai02_bit_banding.svg", "bai03_clock_tree.svg"];
  for (const tf of testFiles) {
    if (urlMap[tf]) {
      const fullUrl = "https://embedded-aiot.com" + urlMap[tf];
      const ok = await verifyUrl(fullUrl);
      console.log(`Kiểm tra live URL ${fullUrl}: ${ok ? "✓ 200 OK" : "✗ LỖI"}`);
    }
  }

  // Biên dịch lại 26 bài học với URL ảnh mới và hỗ trợ song ngữ VI / EN
  console.log("\n=== BIÊN DỊCH VÀ CẬP NHẬT 26 BÀI HỌC (SONG NGỮ VI/EN) VỚI URL ẢNH THẬT ===");

  const mdDir = "F:\\Advance_C\\stm32f103c8";
  const viDir = path.join(mdDir, "vi");
  const enDir = path.join(mdDir, "en");

  const rawFiles: Array<{ name: string; content: string }> = [];

  if (fs.existsSync(viDir)) {
    fs.readdirSync(viDir)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => {
        rawFiles.push({
          name: `vi/${f}`,
          content: fs.readFileSync(path.join(viDir, f), "utf-8"),
        });
      });
  }

  if (fs.existsSync(enDir)) {
    fs.readdirSync(enDir)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => {
        rawFiles.push({
          name: `en/${f}`,
          content: fs.readFileSync(path.join(enDir, f), "utf-8"),
        });
      });
  }

  if (rawFiles.length === 0) {
    fs.readdirSync(mdDir)
      .filter((f) => f.endsWith(".md") && !f.toLowerCase().includes("readme"))
      .forEach((f) => {
        rawFiles.push({
          name: f,
          content: fs.readFileSync(path.join(mdDir, f), "utf-8"),
        });
      });
  }

  const pairedLessons = pairBilingualMarkdownFiles(rawFiles);
  const sortedEntries = Object.entries(urlMap).sort((a, b) => b[0].length - a[0].length);

  const parsedLessons: any[] = [];

  for (const item of pairedLessons) {
    let contentHtml = item.contentHtml || "";
    let contentHtmlEn = item.contentHtmlEn || "";

    // Thay thế toàn bộ các link ảnh cục bộ bằng live URL /uploads/...
    for (const [svgName, liveUrl] of sortedEntries) {
      if (contentHtml) {
        contentHtml = contentHtml.split(`/images/stm32f103/${svgName}`).join(liveUrl);
        contentHtml = contentHtml.split(`/images/${svgName}`).join(liveUrl);
        contentHtml = contentHtml.split(`../images/${svgName}`).join(liveUrl);
        contentHtml = contentHtml.split(`images/${svgName}`).join(liveUrl);
        contentHtml = contentHtml.split(`"${svgName}"`).join(`"${liveUrl}"`);
      }
      if (contentHtmlEn) {
        contentHtmlEn = contentHtmlEn.split(`/images/stm32f103/${svgName}`).join(liveUrl);
        contentHtmlEn = contentHtmlEn.split(`/images/${svgName}`).join(liveUrl);
        contentHtmlEn = contentHtmlEn.split(`../images/${svgName}`).join(liveUrl);
        contentHtmlEn = contentHtmlEn.split(`images/${svgName}`).join(liveUrl);
        contentHtmlEn = contentHtmlEn.split(`"${svgName}"`).join(`"${liveUrl}"`);
      }
    }

    parsedLessons.push({
      order: item.lessonNumber,
      title: item.title,
      titleEn: item.titleEn || null,
      slug: item.slug,
      duration: item.duration,
      free: item.lessonNumber <= 5,
      summary: item.summary || null,
      summaryEn: item.summaryEn || null,
      contentHtml: contentHtml || null,
      contentHtmlEn: contentHtmlEn || null,
      contentMarkdown: item.contentMarkdown || null,
      contentMarkdownEn: item.contentMarkdownEn || null,
      codeSnippet: item.codeSnippet || null,
      codeLang: item.codeLang || "c",
      codeFilename: item.codeFilename || "main.c",
    });

    console.log(
      `  ✓ Bài ${item.lessonNumber} [${item.status}]: ${item.title}${
        item.titleEn ? ` | EN: ${item.titleEn}` : ""
      }`
    );
  }

  // 5 Modules với song ngữ VI / EN
  const moduleDefs = [
    {
      title: "Học phần 1: Nền Tảng ARM Cortex-M3 & Ngoại Vi Cơ Bản",
      titleEn: "Module 1: ARM Cortex-M3 Core Architecture & Basic Peripherals",
      range: [1, 5],
    },
    {
      title: "Học phần 2: Hệ Thống Định Thời Timers, PWM & Xử Lý Tín Hiệu ADC",
      titleEn: "Module 2: Timers, PWM & ADC Signal Processing",
      range: [6, 12],
    },
    {
      title: "Học phần 3: Các Chuẩn Giao Tiếp Nối Tiếp Công Nghiệp & DMA Controller",
      titleEn: "Module 3: Industrial Serial Interfaces & DMA Controller",
      range: [13, 17],
    },
    {
      title: "Học phần 4: Tiết Kiệm Năng Lượng & Hệ Điều Hành Thời Gian Thực FreeRTOS",
      titleEn: "Module 4: Low Power Modes & FreeRTOS Multitasking",
      range: [18, 22],
    },
    {
      title: "Học phần 5: Giao Thức Nâng Cao (CAN Bus, USB FS) & Chuyên Gia Firmware",
      titleEn: "Module 5: Advanced Protocols (CAN Bus, USB FS) & Expert Debugging",
      range: [23, 26],
    },
  ];

  const modules = moduleDefs.map((def, mIdx) => ({
    module: def.title,
    moduleEn: def.titleEn,
    order: mIdx + 1,
    lessons: parsedLessons
      .filter((l) => l.order >= def.range[0] && l.order <= def.range[1])
      .map((l, lIdx) => ({
        title: l.title,
        titleEn: l.titleEn,
        slug: l.slug,
        duration: l.duration,
        free: l.free,
        summary: l.summary,
        summaryEn: l.summaryEn,
        contentHtml: l.contentHtml,
        contentHtmlEn: l.contentHtmlEn,
        contentMarkdown: l.contentMarkdown,
        contentMarkdownEn: l.contentMarkdownEn,
        codeSnippet: l.codeSnippet,
        order: lIdx + 1,
      })),
  }));

  console.log("\nĐang gửi bản cập nhật đến PUT https://embedded-aiot.com/api/courses/lap-trinh-stm32f103-chuyen-sau ...");

  const payload = JSON.stringify({
    title: "Lập Trình STM32F103 Chuyên Sâu: ARM Cortex-M3 Bare-Metal & SPL",
    titleEn: "Deep-Dive STM32F103 Programming: ARM Cortex-M3 Bare-Metal & SPL",
    slug: "lap-trinh-stm32f103-chuyen-sau",
    description:
      "Khóa học toàn diện 26 bài học thực chiến STM32F103 (Blue Pill) từ kiến trúc thanh ghi Cortex-M3, Bit-Banding, Clock Tree, GPIO, Timer PWM/Encoder, ADC, DMA, các chuẩn giao tiếp UART/I2C/SPI/CAN, USB Device, FreeRTOS đa nhiệm thời gian thực và Custom ISP Bootloader.",
    descriptionEn:
      "Comprehensive 26-lesson masterclass for STM32F103 (Blue Pill) from Cortex-M3 register architecture, Bit-Banding, Clock Tree, GPIO, Timer PWM/Encoder, ADC, DMA, UART/I2C/SPI/CAN communications, USB Device, real-time multitasking FreeRTOS to Custom ISP Bootloader.",
    level: "intermediate",
    category: "embedded-rtos",
    duration: "26 bài học (30 giờ)",
    price: "free",
    thumbnail: "/images/stm32f103/stm32f103c8.webp",
    githubRepo: "https://github.com/anhln-embedded/Advance_C",
    featured: true,
    modules: modules,
  });

  let updateSuccess = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`[Lần thử ${attempt}/5] Đang gửi payload (${Math.round(payload.length / 1024)} KB)...`);
      const putRes = await fetch("https://embedded-aiot.com/api/courses/cmtyvbpav0000qu2u1eiebdym", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: payload,
      });

      const putJson = await putRes.json();
      if (putJson.success) {
        console.log("\n=======================================================");
        console.log("🎉 CẬP NHẬT TOÀN BỘ KHÓA HỌC & HÌNH ẢNH HOÀN TẤT!");
        console.log("=======================================================");
        console.log("Tất cả hình ảnh đã được chuyển sang đường dẫn live /uploads/... và trả về 200 OK!");
        updateSuccess = true;
        break;
      } else {
        console.error("API trả về lỗi:", putJson.error || putJson);
      }
    } catch (err: any) {
      console.error(`Lỗi kết nối lần ${attempt}:`, err?.message || err);
      if (attempt < 5) {
        console.log("Đợi 4 giây trước khi thử lại...");
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  if (!updateSuccess) {
    console.error("Không thể cập nhật khóa học sau 5 lần thử.");
  }
}

main().catch(console.error);
