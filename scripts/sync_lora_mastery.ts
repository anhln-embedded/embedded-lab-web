import fs from "fs";
import path from "path";
import { parseSingleMarkdownArticle } from "../src/lib/markdown-importer";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TOPIC_SLUG = "kien-truc-lap-trinh-lora-lorawan-chuyen-sau-tu-vi-dieu-khien-den-linux-kernel-aosp";

interface LessonMapping {
  order: number;
  slug: string;
  filePath: string;
  customTitle?: string;
}

const VI_DIR = "F:\\Advance_C\\lora-embedded-linux-mastery\\vi";
const README_PATH = "F:\\Advance_C\\lora-embedded-linux-mastery\\README.md";

const MAPPINGS: LessonMapping[] = [
  {
    order: 1,
    slug: "bai-01-tong-quan-lora-lorawan-va-he-sinh-thai-ket-noi-khong-day-cong-nghiep",
    filePath: path.join(VI_DIR, "Bai 01. Tong quan LoRa LoRaWAN va He sinh thai Ket noi Khong day Cong nghiep.md"),
  },
  {
    order: 2,
    slug: "bai-02-phan-tich-chuyen-sau-lora-phy-spreading-factor-bandwidth-va-link-budget",
    filePath: path.join(VI_DIR, "Bai 02. Phan tich Chuyen sau LoRa PHY Spreading Factor Bandwidth va Link Budget.md"),
  },
  {
    order: 3,
    slug: "bai-03-giai-ma-transceiver-semtech-sx1276-sx1278-va-sx1262",
    filePath: path.join(VI_DIR, "Bai 03. Giai ma Transceiver Semtech SX1276 SX1278 va SX1262.md"),
  },
  {
    order: 4,
    slug: "bai-04-ky-thuat-channel-activity-detection-cad-va-toi-uu-nang-luong-lop-vat-ly",
    filePath: path.join(VI_DIR, "Bai 04. Ky thuat Channel Activity Detection CAD va Toi uu Nang luong Lop Vat ly.md"),
  },
  {
    order: 5,
    slug: "bai-05-giao-tiep-spi-toc-do-cao-voi-radio-transceiver",
    filePath: path.join(VI_DIR, "Bai 05. Giao tiep SPI Toc do cao voi Radio Transceiver Master Mode Burst FIFO va Polling an toan.md"),
  },
  {
    order: 6,
    slug: "bai-06-thiet-ke-may-trang-thai-fsm-dieu-khien-radio-khong-chan",
    filePath: path.join(VI_DIR, "Bai 06. Thiet ke Finite State Machine FSM Dieu khien Radio Non-blocking.md"),
  },
  {
    order: 7,
    slug: "bai-07-quan-ly-ngat-ngoai-vi-dio-interrupts-va-dong-bo-isr",
    filePath: path.join(VI_DIR, "Bai 07. Quan ly Ngat Ngoai vi DIO Interrupts Xu ly Su kien va Dong bo ISR.md"),
  },
  {
    order: 8,
    slug: "bai-08-tich-hop-lora-driver-vao-he-dieu-hanh-thoi-gian-thuc-freertos",
    filePath: path.join(VI_DIR, "Bai 08. Tich hop LoRa Driver vao He dieu hanh Thoi gian thuc FreeRTOS.md"),
  },
  {
    order: 9,
    slug: "bai-09-chien-luoc-quan-ly-nguon-dien-cuc-thap-low-power-sleep-modes",
    filePath: path.join(VI_DIR, "Bai 09. Chien luoc Quan ly Nguon dien Cuc thap Low-Power va Sleep Modes.md"),
  },
  {
    order: 10,
    slug: "bai-10-phan-tich-giai-phap-mang-lora-mesh-va-bay-ack-tung-chang",
    filePath: path.join(VI_DIR, "Bai 10. Phan tich Giai phap Mang LoRa Mesh RadioHead RHMesh va Bay ACK Tung chang.md"),
  },
  {
    order: 11,
    slug: "bai-11-kien-truc-mang-lorawan-toan-dien",
    filePath: path.join(VI_DIR, "Bai 11. Kien truc Mang LoRaWAN Toan dien Star-of-Stars Topology va Network Entities.md"),
  },
  {
    order: 12,
    slug: "bai-12-co-che-kich-hoat-thiet-bi-otaa-vs-abp-va-bao-mat-aes-128",
    filePath: path.join(VI_DIR, "Bai 12. Co che Kich hoat Thiet bi OTAA vs ABP He thong Khoa va Ma hoa AES-128.md"),
  },
  {
    order: 13,
    slug: "bai-13-van-hanh-lorawan-thiet-bi-lop-a-lop-b-lop-c-va-timing-cua-so-rx1rx2",
    filePath: path.join(VI_DIR, "Bai 13. Van hanh LoRaWAN Thiet bi Lop A Lop B Lop C va Timing Cua so RX1 RX2.md"),
  },
  {
    order: 14,
    slug: "bai-14-ky-thuat-adaptive-data-rate-adr-va-quy-chuan-tan-so-khu-vuc",
    filePath: path.join(VI_DIR, "Bai 14. Ky thuat Adaptive Data Rate ADR va Quy chuan Tan so Khu vuc Regional Parameters.md"),
  },
  {
    order: 15,
    slug: "bai-15-cau-hinh-device-tree-dts-cho-giao-dien-spi-va-gpio-radio",
    filePath: path.join(VI_DIR, "Bai 15. Cau hinh Device Tree DTS cho Giao dien SPI Pinmux va GPIO Ngat Radio.md"),
  },
  {
    order: 16,
    slug: "bai-16-linux-spi-subsystem-kien-truc-spidriver-va-quan-ly-bus",
    filePath: path.join(VI_DIR, "Bai 16. Linux SPI Subsystem Kien truc spi_driver probe spi_sync va Quan ly Bus.md"),
  },
  {
    order: 17,
    slug: "bai-17-xu-ly-ngat-radio-trong-linux-top-half-va-threaded-irq",
    filePath: path.join(VI_DIR, "Bai 17. Xu ly Ngat Radio trong Linux Top-Half va Threaded IRQ request_threaded_irq.md"),
  },
  {
    order: 18,
    slug: "bai-18-xay-dung-character-device-driver-read-write-ioctl-va-poll",
    filePath: path.join(VI_DIR, "Bai 18. Xay dung Character Device Driver read write ioctl va Non-blocking poll.md"),
  },
  {
    order: 19,
    slug: "bai-19-so-sanh-kien-truc-kernel-driver-vs-userspace-spidev",
    filePath: path.join(VI_DIR, "Bai 19. So sanh Kien truc Kernel Driver Chuyen dung vs Userspace SPI spidev va libgpiod.md"),
  },
  {
    order: 20,
    slug: "bai-20-thiet-ke-lora-edge-daemon-tren-linux-vong-lap-epoll-va-hang-doi-goi-tin",
    filePath: path.join(VI_DIR, "Bai 20. Thiet ke LoRa Edge Daemon tren Linux Vong lap epoll Packet Queue va Backoff.md"),
  },
  {
    order: 21,
    slug: "bai-21-kien-truc-tich-hop-android-aosp-radio-hal-aidl-va-selinux",
    filePath: path.join(VI_DIR, "Bai 21. Kien truc Tich hop Android AOSP Radio HAL AIDL Interface va Chinh sach SELinux.md"),
  },
  {
    order: 22,
    slug: "bai-22-thiet-ke-he-thong-telematics-fallback-cho-smart-ev-khi-mat-song-cellular",
    filePath: path.join(VI_DIR, "Bai 22. Thiet ke He thong Telematics Fallback cho Smart EV khi Mat Song Cellular.md"),
  },
  {
    order: 23,
    slug: "bai-23-kien-truc-danh-thuc-tu-xa-remote-wake-up-va-quan-ly-mien-nguon",
    filePath: path.join(VI_DIR, "Bai 23. Kien truc Danh thuc Tu xa Remote Wake-up va Quan ly Mien Nguon Power Domains.md"),
  },
  {
    order: 24,
    slug: "bai-24-ky-thuat-do-kiem-debugging-phan-cung-logic-analyzer-va-rf",
    filePath: path.join(VI_DIR, "Bai 24. Ky thuat Do kiem va Debugging Phan cung Logic Analyzer Bus SPI va Do RF.md"),
  },
  {
    order: 25,
    slug: "bai-25-root-cause-analysis-dieu-tra-su-co-mat-goi-va-troi-tan-so",
    filePath: path.join(VI_DIR, "Bai 25. Root Cause Analysis Phuong phap Dieu tra va Khac phuc Su co Mat goi va Troi tan so.md"),
  },
  {
    order: 26,
    slug: "bai-26-so-tay-mock-interview-30-cau-hoi-phan-bien-va-kich-ban-tra-loi-cao-cap",
    filePath: path.join(VI_DIR, "Bai 26. So Tay Mock Interview 30 Cau hoi Phan bien Trong tam va Kich ban Tra loi Ky su Cao cap.md"),
    customTitle: "BÀI 26: SỔ TAY KỸ SƯ CAO CẤP: 30 CÂU HỎI PHẢN BIỆN KIẾN TRÚC & XỬ LÝ SỰ CỐ HỆ THỐNG",
  },
  {
    order: 27,
    slug: "lap-trinh-tich-hop-lora-lorawan-chuyen-sau",
    filePath: README_PATH,
    customTitle: "Lập Trình & Tích Hợp LoRa / LoRaWAN Chuyên Sâu: Khung Chương Trình & Tổng Quan",
  },
];

async function syncAll() {
  console.log("==================================================================");
  console.log("🚀 BẮT ĐẦU ĐỒNG BỘ TOÀN DIỆN 27 BÀI VIẾT LORA LÊN PRODUCTION CLOUD");
  console.log("==================================================================");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < MAPPINGS.length; i++) {
    const item = MAPPINGS[i];
    console.log(`\n[${i + 1}/${MAPPINGS.length}] Đang xử lý: ${item.slug} ...`);

    if (!fs.existsSync(item.filePath)) {
      console.error(`❌ Không tìm thấy file: ${item.filePath}`);
      failCount++;
      continue;
    }

    const rawMd = fs.readFileSync(item.filePath, "utf-8");
    const parsed = parseSingleMarkdownArticle(rawMd, item.order, path.basename(item.filePath));

    // Tiêu đề & tóm tắt
    const title = item.customTitle || parsed.title;
    const summary = parsed.summary || "";
    const readTime = parsed.readTime || "15 phút";

    // Làm sạch HTML: Thay thế mọi link ảnh darkSvg không tồn tại bằng link ảnh chính
    let contentHtml = parsed.contentHtml;
    contentHtml = contentHtml.replace(
      /\/uploads\/bai01_lora_topology_comparison_524630_dark\.svg/g,
      "/uploads/bai01_lora_topology_comparison_524630.svg"
    );
    contentHtml = contentHtml.replace(
      /\/uploads\/bai02_css_chirp_modulation_525804_dark\.svg/g,
      "/uploads/bai02_css_chirp_modulation_525804.svg"
    );
    // Thay thế các link tương đối cũ nếu còn sót
    contentHtml = contentHtml.replace(
      /\/images\/bai01_lora_topology_comparison\.svg/g,
      "/uploads/bai01_lora_topology_comparison_524630.svg"
    );
    contentHtml = contentHtml.replace(
      /\/images\/bai02_css_chirp_modulation\.svg/g,
      "/uploads/bai02_css_chirp_modulation_525804.svg"
    );

    const payload = {
      title,
      summary,
      readTime,
      contentHtml,
      codeSnippet: parsed.codeSnippet || null,
      codeLang: parsed.codeLang || "c",
      codeFilename: parsed.codeFilename || "main.c",
      changeSummary: "Đồng bộ chuẩn tài liệu kỹ thuật: loại bỏ nội dung phỏng vấn, cập nhật link ảnh hoạt động 100%",
    };

    const targetUrl = `https://embedded-aiot.com/api/tutorials/${TOPIC_SLUG}/articles/${item.slug}`;

    try {
      const res = await fetch(targetUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (res.status === 200 && resJson.success) {
        console.log(`   ✓ Thành công! [${resJson.data.article.id}] "${title}"`);
        successCount++;
      } else {
        console.error(`   ✗ Lỗi API (${res.status}):`, resJson.error || resJson);
        failCount++;
      }
    } catch (err: any) {
      console.error(`   ✗ Lỗi kết nối:`, err.message);
      failCount++;
    }

    // Delay 400ms giữa các request để đảm bảo an toàn cho máy chủ
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  console.log("\n==================================================================");
  console.log(`📊 KẾT QUẢ ĐỒNG BỘ: ${successCount} thành công, ${failCount} thất bại.`);
  console.log("==================================================================");
}

syncAll().catch(console.error);

