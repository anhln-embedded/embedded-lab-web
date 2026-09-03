"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "superadmin" | "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface RoadmapProgress {
  [trackId: string]: string[]; // list of completed step IDs
}

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  quickLogin: (role: UserRole) => void;
  register: (name: string, email: string, password?: string, role?: UserRole) => { success: boolean; message?: string };
  loginWithOAuth: (userData: { name: string; email: string; avatar?: string; role?: UserRole; provider?: string }) => void;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUser: (userId: string) => void;
  // Roadmap Progress
  completedSteps: RoadmapProgress;
  toggleRoadmapStep: (trackId: string, stepId: string) => void;
  isStepCompleted: (trackId: string, stepId: string) => boolean;
}

import { normalizeEmail, parseEmailList, safeStorage } from "@/lib/utils";

export { normalizeEmail, parseEmailList, safeStorage };

/**
 * Lấy danh sách email Super Admin từ biến môi trường SUPER_ADMIN_EMAILS / NEXT_PUBLIC_SUPER_ADMIN_EMAILS trong .env
 */
export function getSuperAdminEmails(): string[] {
  const envRaw =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAILS)) ||
    "anhln.embedded@gmail.com,anhlnembedded@gmail.com";

  return parseEmailList(envRaw);
}

/**
 * Kiểm tra xem một email có thuộc danh sách Super Admin cấu hình trong .env hay không
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  const adminList = getSuperAdminEmails();
  return adminList.includes(normalized);
}

const DEFAULT_USERS: User[] = [
  {
    id: "usr_superadmin",
    name: "Super Admin (PTIT Lab)",
    email: "anhln.embedded@gmail.com",
    role: "superadmin",
    avatar: "🛡️",
    bio: "Quản trị viên tối cao hệ thống Embedded AIoT Laboratory PTIT",
    createdAt: "2026-01-01",
  },
];

const CURRENT_USER_KEY = "embedded_lab_current_user";
const USERS_LIST_KEY = "embedded_lab_all_users";
const ROADMAP_KEY_PREFIX = "embedded_lab_roadmap_";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(DEFAULT_USERS);
  const [completedSteps, setCompletedSteps] = useState<RoadmapProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [serverSuperAdmins, setServerSuperAdmins] = useState<string[]>([]);

  const checkIsSuperAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const clean = normalizeEmail(email);
    return isSuperAdminEmail(clean) || serverSuperAdmins.includes(clean);
  };

  // 1. Fetch server-side runtime .env config for Super Admin list & load DB users
  useEffect(() => {
    // A. Fetch Super Admin config from .env
    fetch("/api/auth/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.superAdminEmails && Array.isArray(data.superAdminEmails)) {
          const list: string[] = data.superAdminEmails.map((e: string) => normalizeEmail(e));
          setServerSuperAdmins(list);

          // Tự động nâng cấp tài khoản đang đăng nhập hoặc đã lưu nếu thuộc danh sách .env trên server
          setAllUsers((prevUsers) => {
            const updated = prevUsers.map((u) => {
              if (list.includes(normalizeEmail(u.email))) {
                return { ...u, role: "superadmin" as UserRole, bio: "Super Admin quản trị viên Embedded-AIoT Lab PTIT" };
              }
              return u;
            });
            safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updated));
            return updated;
          });

          setUser((prevUser) => {
            if (prevUser && list.includes(normalizeEmail(prevUser.email))) {
              const upgraded: User = {
                ...prevUser,
                role: "superadmin" as UserRole,
                bio: "Super Admin quản trị viên Embedded-AIoT Lab PTIT",
              };
              safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(upgraded));
              return upgraded;
            }
            return prevUser;
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch auth config:", err));

    // B. Fetch real users from SQLite Database API
    fetch("/api/users")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllUsers(json.data);
          safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(json.data));
        }
      })
      .catch((err) => console.warn("Failed to fetch users from server DB:", err));
  }, []);

  // 2. Initialize from LocalStorage (cache fallback)
  useEffect(() => {
    try {
      // Load all users from cache if available
      const storedUsersRaw = safeStorage.getItem(USERS_LIST_KEY);
      let users = DEFAULT_USERS;
      if (storedUsersRaw) {
        try {
          const parsed = JSON.parse(storedUsersRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            users = parsed;
          }
        } catch {
          // ignore
        }
      }

      setAllUsers(users);

      // Load current user session
      const storedCurrent = safeStorage.getItem(CURRENT_USER_KEY);
      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        let matchingUser = users.find((u) => normalizeEmail(u.email) === normalizeEmail(parsed.email)) || parsed;
        if (isSuperAdminEmail(matchingUser.email) || serverSuperAdmins.includes(normalizeEmail(matchingUser.email))) {
          matchingUser = { ...matchingUser, role: "superadmin" as UserRole };
        }
        setUser(matchingUser);
        safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matchingUser));

        // Load roadmap progress for this user
        const progressRaw = safeStorage.getItem(`${ROADMAP_KEY_PREFIX}${matchingUser.id}`);
        if (progressRaw) {
          setCompletedSteps(JSON.parse(progressRaw));
        }
      }
    } catch (e) {
      console.error("Failed to load auth state from safeStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, [serverSuperAdmins]);

  const login = (email: string, _password?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    let found = allUsers.find((u) => normalizeEmail(u.email) === normalizeEmail(cleanEmail));

    if (found) {
      if (checkIsSuperAdmin(cleanEmail) && found.role !== "superadmin") {
        found = {
          ...found,
          role: "superadmin",
          bio: "Super Admin quản trị viên Embedded-AIoT Lab PTIT",
        };
        const updatedList = allUsers.map((u) => (u.id === found!.id ? found! : u));
        setAllUsers(updatedList);
        safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));
      }

      setUser(found);
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));

      // Load roadmap progress for this user
      const progressRaw = safeStorage.getItem(`${ROADMAP_KEY_PREFIX}${found.id}`);
      if (progressRaw) {
        setCompletedSteps(JSON.parse(progressRaw));
      } else {
        setCompletedSteps({});
      }
      return { success: true };
    }

    if (checkIsSuperAdmin(cleanEmail)) {
      const superAdminUser: User = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split("@")[0] || "Super Admin",
        email: cleanEmail,
        role: "superadmin",
        avatar: "🛡️",
        bio: "Super Admin quản trị viên Embedded-AIoT Lab PTIT",
        createdAt: new Date().toISOString().split("T")[0],
      };
      const updatedList = [...allUsers, superAdminUser];
      setAllUsers(updatedList);
      safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));
      setUser(superAdminUser);
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(superAdminUser));
      setCompletedSteps({});
      return { success: true };
    }

    return {
      success: false,
      message: "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký.",
    };
  };

  const quickLogin = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role) || DEFAULT_USERS.find((u) => u.role === role);
    if (target) {
      setUser(target);
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));

      const progressRaw = safeStorage.getItem(`${ROADMAP_KEY_PREFIX}${target.id}`);
      if (progressRaw) {
        setCompletedSteps(JSON.parse(progressRaw));
      } else {
        setCompletedSteps({});
      }
    }
  };

  const register = (name: string, email: string, _password?: string, role: UserRole = "user") => {
    const cleanEmail = email.toLowerCase().trim();
    if (allUsers.some((u) => normalizeEmail(u.email) === normalizeEmail(cleanEmail))) {
      return { success: false, message: "Email này đã được đăng ký!" };
    }

    const isSuperAdmin = checkIsSuperAdmin(cleanEmail);
    const assignedRole: UserRole = isSuperAdmin ? "superadmin" : role;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      avatar: assignedRole === "superadmin" ? "🛡️" : assignedRole === "admin" ? "✍️" : "🎓",
      bio: isSuperAdmin ? "Super Admin quản trị viên Embedded-AIoT Lab PTIT" : "Thành viên Embedded-AIoT Lab PTIT",
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Save to SQLite database via API
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        title: newUser.bio,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.id) {
          setAllUsers((prev) =>
            prev.map((u) => (u.email === newUser.email ? { ...u, id: json.data.id } : u))
          );
        }
      })
      .catch((e) => console.error("Failed to persist user to SQLite:", e));

    const updatedList = [...allUsers, newUser];
    setAllUsers(updatedList);
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

    // Auto login
    setUser(newUser);
    safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setCompletedSteps({});

    return { success: true };
  };

  const loginWithOAuth = (userData: {
    name: string;
    email: string;
    avatar?: string;
    role?: UserRole;
    provider?: string;
  }) => {
    const cleanEmail = userData.email.toLowerCase().trim();
    const isSuperAdmin =
      userData.role === "superadmin" ||
      checkIsSuperAdmin(cleanEmail);

    const assignedRole: UserRole = isSuperAdmin ? "superadmin" : userData.role || "user";
    const existing = allUsers.find((u) => normalizeEmail(u.email) === normalizeEmail(cleanEmail));

    if (existing) {
      const updatedUser: User = {
        ...existing,
        name: userData.name || existing.name,
        avatar: userData.avatar || existing.avatar || (assignedRole === "superadmin" ? "🛡️" : "👤"),
        role: isSuperAdmin ? "superadmin" : existing.role,
        bio: isSuperAdmin ? "Super Admin quản trị viên Embedded-AIoT Lab PTIT" : existing.bio,
      };

      const updatedList = allUsers.map((u) => (u.id === existing.id ? updatedUser : u));
      setAllUsers(updatedList);
      safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

      setUser(updatedUser);
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      const progressRaw = safeStorage.getItem(`${ROADMAP_KEY_PREFIX}${existing.id}`);
      if (progressRaw) {
        setCompletedSteps(JSON.parse(progressRaw));
      } else {
        setCompletedSteps({});
      }
    } else {
      const newUser: User = {
        id: `usr_oauth_${Date.now()}`,
        name: userData.name.trim() || "Thành viên Google",
        email: cleanEmail,
        role: assignedRole,
        avatar: userData.avatar || (assignedRole === "superadmin" ? "🛡️" : "👤"),
        bio: isSuperAdmin
          ? "Super Admin quản trị viên Embedded-AIoT Lab PTIT"
          : "Thành viên Embedded-AIoT Lab PTIT (Đăng nhập qua Google)",
        createdAt: new Date().toISOString().split("T")[0],
      };

      const updatedList = [...allUsers, newUser];
      setAllUsers(updatedList);
      safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

      setUser(newUser);
      safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setCompletedSteps({});
    }
  };

  const logout = () => {
    setUser(null);
    safeStorage.removeItem(CURRENT_USER_KEY);
    setCompletedSteps({});
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    // Call server API to update role in SQLite
    fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole }),
    }).catch((e) => console.error("Failed to update user role on server:", e));

    const updatedList = allUsers.map((u) => {
      if (u.id === userId) {
        const updated = { ...u, role: newRole };
        if (user && user.id === userId) {
          setUser(updated);
          safeStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    });

    setAllUsers(updatedList);
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));
  };

  const deleteUser = (userId: string) => {
    // Call server API to delete from SQLite
    fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    }).catch((e) => console.error("Failed to delete user on server:", e));

    const updatedList = allUsers.filter((u) => u.id !== userId);
    setAllUsers(updatedList);
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

    if (user && user.id === userId) {
      logout();
    }
  };

  const toggleRoadmapStep = (trackId: string, stepId: string) => {
    if (!user) return;

    setCompletedSteps((prev) => {
      const currentTrackSteps = prev[trackId] || [];
      const exists = currentTrackSteps.includes(stepId);
      const updatedTrackSteps = exists
        ? currentTrackSteps.filter((id) => id !== stepId)
        : [...currentTrackSteps, stepId];

      const newProgress = {
        ...prev,
        [trackId]: updatedTrackSteps,
      };

      safeStorage.setItem(`${ROADMAP_KEY_PREFIX}${user.id}`, JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const isStepCompleted = (trackId: string, stepId: string) => {
    return (completedSteps[trackId] || []).includes(stepId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        isLoading,
        login,
        quickLogin,
        register,
        loginWithOAuth,
        logout,
        updateUserRole,
        deleteUser,
        completedSteps,
        toggleRoadmapStep,
        isStepCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
