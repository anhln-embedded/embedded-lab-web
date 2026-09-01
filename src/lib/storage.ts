/**
 * An toàn khi truy cập LocalStorage trong mọi môi trường:
 * - Tránh lỗi 'SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.'
 *   khi chạy trong iframe, chế độ ẩn danh chặn cookie bên thứ 3, hoặc sandbox webview.
 * - Tự động fallback sang in-memory Map khi localStorage bị chặn hoặc không khả dụng.
 */

const memoryStore = new Map<string, string>();

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Bị chặn bảo mật hoặc lỗi truy cập
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Bị chặn bảo mật hoặc lỗi quota
    }
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Bị chặn bảo mật
    }
    memoryStore.delete(key);
  },

  clear(): void {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        return;
      }
    } catch {
      // Bị chặn bảo mật
    }
    memoryStore.clear();
  },

  isAvailable(): boolean {
    return isStorageAvailable();
  },
};
