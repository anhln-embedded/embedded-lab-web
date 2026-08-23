"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, siteConfig } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  Sun,
  Moon,
  Search,
  LogIn,
  LogOut,
  ShieldCheck,
  Edit3,
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  UserCheck,
  Award
} from "lucide-react";
import { SearchModal } from "@/components/ui/SearchModal";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    } else {
      setDarkMode(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode, mounted]);

  const navItems = siteConfig.navItems;

  return (
    <header className="sticky top-0 z-50 bg-bg-panel/90 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-18 gap-4">
          {/* Left: Logo & PTIT Branding */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none flex-shrink-0"
            aria-label="EMBEDDED-AIOT Electronics of PTIT Home"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-bg-elevated p-1 border border-border group-hover:border-accent transition-all duration-300 flex items-center justify-center shadow-sm">
              <Image
                src="/images/logo.png"
                alt="EMBEDDED-AIOT PTIT Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg tracking-tight text-text-primary group-hover:text-accent transition-colors">
                EMBEDDED<span className="text-accent">-AIOT</span>
              </span>
              <span className="text-[11px] font-medium text-text-muted tracking-wider uppercase">
                Electronics of PTIT
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center justify-center gap-5 xl:gap-7 flex-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 text-xs xl:text-sm font-medium transition-colors hover:text-accent",
                    isActive ? "text-accent font-semibold" : "text-text-secondary"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-accent rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Search Trigger Button - Icon Kính Lúp Gọn Gàng */}
            {pathname !== "/" && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-search-modal"));
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-white dark:bg-bg-elevated/80 text-text-muted hover:text-accent hover:border-accent/50 transition-all shadow-sm"
                aria-label="Tìm kiếm (Ctrl+K)"
                title="Tìm kiếm (Ctrl+K)"
              >
                <Search className="h-4 w-4 text-accent" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors border border-transparent hover:border-border"
              aria-label={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            >
              {mounted ? (
                darkMode ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-bg-elevated hover:border-accent/50 transition-all text-xs"
                >
                  <span className="text-base">{user.avatar || "👤"}</span>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-semibold text-text-primary line-clamp-1 max-w-[110px]">
                      {user.name}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        color:
                          user.role === "superadmin"
                            ? "#a855f7"
                            : user.role === "admin"
                            ? "#f05a28"
                            : "#10b981",
                      }}
                    >
                      {user.role === "superadmin"
                        ? "Superadmin"
                        : user.role === "admin"
                        ? "Admin"
                        : "Sinh viên"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-panel border border-border shadow-2xl p-2 z-50 animate-fade-in text-xs">
                    <div className="px-3 py-2.5 border-b border-border/80 mb-1">
                      <div className="font-bold text-text-primary">{user.name}</div>
                      <div className="text-[11px] text-text-muted font-mono truncate">{user.email}</div>
                    </div>

                    {(user.role === "superadmin" || user.role === "admin") && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-accent" />
                        <span>Bảng Quản Trị Admin</span>
                      </Link>
                    )}

                    {(user.role === "superadmin" || user.role === "admin") && (
                      <Link
                        href="/admin/posts/new"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-accent" />
                        <span>Đăng Bài Viết Mới</span>
                      </Link>
                    )}

                    {user.role === "superadmin" && (
                      <Link
                        href="/admin/users"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>Quản Lý Thành Viên</span>
                      </Link>
                    )}

                    <Link
                      href="/roadmap"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Lộ Trình Của Tôi</span>
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors border-t border-border/60 mt-1"
                    >
                      <UserCheck className="w-4 h-4 text-text-muted" />
                      <span>Đổi Tài Khoản / Vai Trò</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="pill"
                size="sm"
                className="bg-gradient-to-r from-accent to-accent-hover text-white shadow-sm hover:shadow-accent font-medium text-xs px-3.5"
                asChild
              >
                <Link href="/login">
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Đăng nhập
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <SearchModal />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-bg-panel/95 animate-slide-up">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between",
                      isActive
                        ? "text-accent bg-accent-muted/40 font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </Link>
                );
              })}

              {user ? (
                <div className="pt-3 mt-2 border-t border-border space-y-2">
                  <div className="px-3 py-1 flex items-center justify-between text-xs text-text-muted">
                    <span>Đã đăng nhập: <strong>{user.name}</strong></span>
                    <span className="uppercase text-accent font-bold">({user.role})</span>
                  </div>
                  {(user.role === "superadmin" || user.role === "admin") && (
                    <Button variant="outline" className="w-full text-xs" asChild>
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        Vào Bảng Quản Trị Admin
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-red-400"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="pt-3 mt-2 border-t border-border">
                  <Button variant="pill" className="w-full bg-accent text-white" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Đăng nhập / Đăng ký
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}