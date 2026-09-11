/**
 * Universal Video URL Parser & Embed Converter
 * Supports: YouTube, Microsoft OneDrive, Google Drive, Vimeo, Loom, and Direct Video Files (MP4/WebM).
 */

export type VideoSourceType =
  | "youtube"
  | "onedrive"
  | "gdrive"
  | "vimeo"
  | "loom"
  | "direct"
  | "iframe";

export interface ParsedVideoSource {
  type: VideoSourceType;
  embedUrl: string;
  rawUrl: string;
  providerName: string;
  isDirectFile: boolean;
  notes?: string;
}

export function parseVideoSource(rawUrl?: string | null): ParsedVideoSource | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. Direct Video Files (.mp4, .webm, .ogg, .mov, .m4v, or blob)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed) || trimmed.startsWith("blob:")) {
    return {
      type: "direct",
      embedUrl: trimmed,
      rawUrl: trimmed,
      providerName: "Video Trực Tiếp (MP4/WebM)",
      isDirectFile: true,
    };
  }

  // 2. YouTube
  const ytMatch = trimmed.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|\&v=)([^#\&\?]*).*/i);
  if (ytMatch && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&fs=1&enablejsapi=1&modestbranding=1`,
      rawUrl: trimmed,
      providerName: "YouTube",
      isDirectFile: false,
    };
  }
  if (trimmed.includes("youtube.com/embed/")) {
    const separator = trimmed.includes("?") ? "&" : "?";
    return {
      type: "youtube",
      embedUrl: `${trimmed}${separator}autoplay=1&rel=0&fs=1&enablejsapi=1`,
      rawUrl: trimmed,
      providerName: "YouTube",
      isDirectFile: false,
    };
  }

  // 3. Google Drive
  const gdriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: "gdrive",
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawUrl: trimmed,
      providerName: "Google Drive",
      isDirectFile: false,
    };
  }

  // 4. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/|channels\/[\w\d]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&autopause=0`,
      rawUrl: trimmed,
      providerName: "Vimeo",
      isDirectFile: false,
    };
  }

  // 5. Loom
  const loomMatch = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const loomId = loomMatch[1];
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loomId}?autoplay=1`,
      rawUrl: trimmed,
      providerName: "Loom Video",
      isDirectFile: false,
    };
  }

  // 6. Microsoft OneDrive & SharePoint
  if (trimmed.includes("onedrive.live.com") || trimmed.includes("1drv.ms") || trimmed.includes("sharepoint.com")) {
    // If it's already an onedrive embed link
    if (trimmed.includes("onedrive.live.com/embed")) {
      return {
        type: "onedrive",
        embedUrl: trimmed,
        rawUrl: trimmed,
        providerName: "Microsoft OneDrive",
        isDirectFile: false,
      };
    }

    // Attempt to convert individual file link with cid & resid to embed
    try {
      const urlObj = new URL(trimmed);
      const cid = urlObj.searchParams.get("cid");
      const resid = urlObj.searchParams.get("resid") || urlObj.searchParams.get("id");
      const authkey = urlObj.searchParams.get("authkey");

      if (cid && resid) {
        let embed = `https://onedrive.live.com/embed?cid=${cid}&resid=${encodeURIComponent(resid)}`;
        if (authkey) embed += `&authkey=${authkey}`;
        return {
          type: "onedrive",
          embedUrl: embed,
          rawUrl: trimmed,
          providerName: "Microsoft OneDrive",
          isDirectFile: false,
          notes: "Video bài giảng từ OneDrive cá nhân",
        };
      }
    } catch {
      // continue fallback
    }

    return {
      type: "onedrive",
      embedUrl: trimmed,
      rawUrl: trimmed,
      providerName: "Microsoft OneDrive",
      isDirectFile: false,
      notes: "Tài nguyên video lưu trữ trên Microsoft OneDrive",
    };
  }

  // 7. Generic / Custom Embed URL or Iframe
  return {
    type: "iframe",
    embedUrl: trimmed,
    rawUrl: trimmed,
    providerName: "Trình phát Web / Trực tuyến",
    isDirectFile: false,
  };
}
