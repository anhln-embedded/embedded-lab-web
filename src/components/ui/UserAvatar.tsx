"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  role?: string | null;
  className?: string;
  size?: number;
  textClassName?: string;
  alt?: string;
}

export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  );
}

export function getDefaultRoleAvatar(role?: string | null): string {
  if (role === "superadmin") return "🛡️";
  if (role === "admin") return "✍️";
  if (role === "lab_member") return "🔬";
  return "🎓";
}

export function UserAvatar({
  avatar,
  name,
  role,
  className = "w-8 h-8 rounded-full",
  size = 40,
  textClassName,
  alt,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const isImg = Boolean(avatar && isImageUrl(avatar) && !imageError);

  if (isImg && avatar) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center flex-shrink-0 select-none ${className}`}>
        {/* Using standard img with no-referrer for external OAuth avatars (Google, GitHub, etc.) */}
        <img
          src={avatar}
          alt={alt || name || "User Avatar"}
          width={size}
          height={size}
          className="w-full h-full object-cover rounded-[inherit]"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
    );
  }

  // If avatar is an emoji string (like 🛡️, 🔬, ✍️, 👨‍💻)
  if (avatar && !isImageUrl(avatar)) {
    return (
      <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
        <span className={textClassName || ""}>{avatar}</span>
      </div>
    );
  }

  // If name is available, display an initial badge
  if (name && name.trim()) {
    const trimmed = name.trim();
    const words = trimmed.split(" ").filter(Boolean);
    const initial = words.length > 0 ? words[words.length - 1].charAt(0).toUpperCase() : trimmed.charAt(0).toUpperCase();
    return (
      <div
        className={`flex items-center justify-center flex-shrink-0 select-none bg-gradient-to-br from-accent/25 via-accent/15 to-accent/5 text-accent font-bold border border-accent/30 shadow-2xs ${className}`}
        title={name}
      >
        <span className={textClassName || "text-xs"}>{initial}</span>
      </div>
    );
  }

  const fallbackEmoji = getDefaultRoleAvatar(role);
  return (
    <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <span className={textClassName || ""}>{fallbackEmoji}</span>
    </div>
  );
}
