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
  const fallbackEmoji = avatar && !isImageUrl(avatar) ? avatar : getDefaultRoleAvatar(role);

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

  return (
    <div className={`flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <span className={textClassName || ""}>{fallbackEmoji}</span>
    </div>
  );
}
