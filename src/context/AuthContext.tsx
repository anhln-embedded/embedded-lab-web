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
  loginWithOAuth: (userData: { name: string; email: string; avatar?: string; provider?: string }) => void;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  deleteUser: (userId: string) => void;
  // Roadmap Progress
  completedSteps: RoadmapProgress;
  toggleRoadmapStep: (trackId: string, stepId: string) => void;
  isStepCompleted: (trackId: string, stepId: string) => boolean;
}

const DEFAULT_USERS: User[] = [
  {
    id: "usr_superadmin",
    name: "Super Admin (PTIT Lab)",
    email: "superadmin@ptit.edu.vn",
    role: "superadmin",
    avatar: "🛡️",
    bio: "Quản trị viên tối cao hệ thống Embedded AIoT Laboratory PTIT",
    createdAt: "2026-01-01",
  },
  {
    id: "usr_admin",
    name: "Kỹ sư Lab (Admin)",
    email: "admin@ptit.edu.vn",
    role: "admin",
    avatar: "✍️",
    bio: "Giảng viên & Kỹ sư nghiên cứu phần cứng / Firmware Embedded-AIoT Lab",
    createdAt: "2026-02-15",
  },
  {
    id: "usr_student",
    name: "Sinh viên PTIT (User)",
    email: "student@ptit.edu.vn",
    role: "user",
    avatar: "🎓",
    bio: "Sinh viên ngành Kỹ thuật Điện tử - Viễn thông / IoT PTIT",
    createdAt: "2026-03-10",
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

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      // Load all users
      const storedUsersRaw = localStorage.getItem(USERS_LIST_KEY);
      let users = DEFAULT_USERS;
      if (storedUsersRaw) {
        users = JSON.parse(storedUsersRaw);
        // Ensure default admin users exist
        DEFAULT_USERS.forEach((defUser) => {
          if (!users.some((u) => u.id === defUser.id || u.email === defUser.email)) {
            users.push(defUser);
          }
        });
      }
      setAllUsers(users);
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));

      // Load current user session
      const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        // Match with updated user state
        const matchingUser = users.find((u) => u.id === parsed.id) || parsed;
        setUser(matchingUser);

        // Load roadmap progress for this user
        const progressRaw = localStorage.getItem(`${ROADMAP_KEY_PREFIX}${matchingUser.id}`);
        if (progressRaw) {
          setCompletedSteps(JSON.parse(progressRaw));
        }
      }
    } catch (e) {
      console.error("Failed to load auth state from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, _password?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const found = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (found) {
      setUser(found);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));

      // Load roadmap progress for this user
      const progressRaw = localStorage.getItem(`${ROADMAP_KEY_PREFIX}${found.id}`);
      if (progressRaw) {
        setCompletedSteps(JSON.parse(progressRaw));
      } else {
        setCompletedSteps({});
      }
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
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(target));

      const progressRaw = localStorage.getItem(`${ROADMAP_KEY_PREFIX}${target.id}`);
      if (progressRaw) {
        setCompletedSteps(JSON.parse(progressRaw));
      } else {
        setCompletedSteps({});
      }
    }
  };

  const register = (name: string, email: string, _password?: string, role: UserRole = "user") => {
    const cleanEmail = email.toLowerCase().trim();
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Email này đã được đăng ký!" };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role,
      avatar: role === "superadmin" ? "🛡️" : role === "admin" ? "✍️" : "🎓",
      bio: "Thành viên Embedded-AIoT Lab PTIT",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedList = [...allUsers, newUser];
    setAllUsers(updatedList);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

    // Auto login
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setCompletedSteps({});

    return { success: true };
  };

  const loginWithOAuth = (userData: { name: string; email: string; avatar?: string; provider?: string }) => {
    const cleanEmail = userData.email.toLowerCase().trim();
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      const updatedUser = {
        ...existing,
        name: existing.name || userData.name,
        avatar: userData.avatar || existing.avatar || "👤",
      };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      const progressRaw = localStorage.getItem(`${ROADMAP_KEY_PREFIX}${existing.id}`);
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
        role: "user",
        avatar: userData.avatar || "👤",
        bio: "Thành viên Embedded-AIoT Lab PTIT (Đăng nhập qua Google)",
        createdAt: new Date().toISOString().split("T")[0],
      };

      const updatedList = [...allUsers, newUser];
      setAllUsers(updatedList);
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

      setUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setCompletedSteps({});
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setCompletedSteps({});
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const updatedList = allUsers.map((u) => {
      if (u.id === userId) {
        const updated = { ...u, role: newRole };
        if (user && user.id === userId) {
          setUser(updated);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    });

    setAllUsers(updatedList);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));
  };

  const deleteUser = (userId: string) => {
    const updatedList = allUsers.filter((u) => u.id !== userId);
    setAllUsers(updatedList);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updatedList));

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

      localStorage.setItem(`${ROADMAP_KEY_PREFIX}${user.id}`, JSON.stringify(newProgress));
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
