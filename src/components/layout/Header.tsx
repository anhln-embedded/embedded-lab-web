"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, siteConfig, safeStorage } from "@/lib/utils";
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
  Award,
  BookOpen,
  Sparkles,
  Compass,
  Route,
  Trophy,
  Zap,
  MessageSquare,
  Newspaper,
  Cpu
} from "lucide-react";
import { SearchModal } from "@/components/ui/SearchModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SuperAdminPointModal } from "@/components/admin/SuperAdminPointModal";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { dict, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileDropdownsOpen, setMobileDropdownsOpen] = React.useState<Record<string, boolean>>({
    "/tutorials": true,
    "/discuss": true,
  });
  const [desktopDropdownOpen, setDesktopDropdownOpen] = React.useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [secretPointModalOpen, setSecretPointModalOpen] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const navContainerRef = React.useRef<HTMLElement>(null);

  const handleUserLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/login")) {
      window.history.replaceState({}, "", "/login");
    }
  };

  React.useEffect(() => {
    setMounted(true);
    const saved = safeStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    } else {
      setDarkMode(false);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setDesktopDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Phím tắt ẩn dành riêng cho Super Admin: Ctrl + Shift + P để mở bảng phù phép điểm
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "P" || e.key === "p")) {
        if (user && user.role === "superadmin") {
          e.preventDefault();
          setSecretPointModalOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user]);

  React.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      safeStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      safeStorage.setItem("darkMode", "false");
    }
  }, [darkMode, mounted]);

  const navItems = React.useMemo(
    () => [
      { label: dict.nav.home, href: "/" },
      {
        label: dict.nav.learning,
        href: "/tutorials",
        items: [
          {
            label: dict.nav.tutorials,
            href: "/tutorials",
            description: dict.nav.tutorialsDesc,
            icon: "BookOpen",
            badge: locale === "vi" ? "24+ bài" : "24+ posts",
          },
          {
            label: dict.nav.courses,
            href: "/courses",
            description: dict.nav.coursesDesc,
            icon: "GraduationCap",
            badge: locale === "vi" ? "Thực hành" : "Hands-on",
          },
          {
            label: dict.nav.roadmap,
            href: "/roadmap",
            description: dict.nav.roadmapDesc,
            icon: "Route",
            badge: locale === "vi" ? "Chuẩn R&D" : "R&D Track",
          },
        ],
      },
      { label: dict.nav.research, href: "/research" },
      { label: dict.nav.blog, href: "/blog" },
      {
        label: dict.nav.more,
        href: "/discuss",
        items: [
          {
            label: dict.nav.discuss,
            href: "/discuss",
            description: dict.nav.discussDesc,
            icon: "MessageSquare",
            badge: locale === "vi" ? "Mới" : "New",
          },
          {
            label: dict.nav.simulator,
            href: "/tools/stm32-simulator",
            description: dict.nav.simulatorDesc,
            icon: "Cpu",
            badge: "STM32",
          },
        ],
      },
    ],
    [dict, locale]
  );

  return (
    <header className="relative lg:sticky lg:top-0 z-50 bg-bg-panel/95 lg:backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2 sm:gap-4">
          {/* Left: Logo & PTIT Branding */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none flex-shrink min-w-0"
            aria-label="EMBEDDED-AIOT Electronics of PTIT Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white dark:bg-bg-elevated p-1 border border-border group-hover:border-accent transition-all duration-300 flex items-center justify-center shadow-sm flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="EMBEDDED-AIOT PTIT Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base md:text-lg tracking-tight text-text-primary group-hover:text-accent transition-colors truncate">
                EMBEDDED<span className="text-accent">-AIOT</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-text-muted tracking-wider uppercase truncate hidden sm:block">
                Electronics of PTIT
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation */}
          {/* Center: Desktop Navigation */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-6 flex-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              if (item.items && item.items.length > 0) {
                const isGroupActive = item.items.some(
                  (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                );
                const isDropdownOpen = desktopDropdownOpen === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative group py-2"
                    onMouseEnter={() => setDesktopDropdownOpen(item.label)}
                    onMouseLeave={() => setDesktopDropdownOpen(null)}
                  >
                    <button
                      onClick={() =>
                        setDesktopDropdownOpen((prev) => (prev === item.label ? null : item.label))
                      }
                      className={cn(
                        "flex items-center gap-1.5 py-1 text-xs xl:text-sm font-medium transition-colors hover:text-accent focus:outline-none cursor-pointer",
                        isGroupActive ? "text-accent font-semibold" : "text-text-secondary"
                      )}
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 text-text-muted group-hover:text-accent",
                          isDropdownOpen ? "rotate-180 text-accent" : "group-hover:rotate-180"
                        )}
                      />
                      {isGroupActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full animate-fade-in" />
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ease-out z-50",
                        isDropdownOpen
                          ? "opacity-100 visible pointer-events-auto"
                          : "opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto"
                      )}
                    >
                      <div className="w-[320px] p-2 bg-bg-panel/95 dark:bg-bg-panel/95 backdrop-blur-xl border border-border/90 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/50 space-y-1">
                        {item.items.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                          const SubIcon =
                            subItem.icon === "BookOpen"
                              ? BookOpen
                              : subItem.icon === "Route"
                              ? Route
                              : subItem.icon === "GraduationCap"
                              ? GraduationCap
                              : subItem.icon === "Sparkles"
                              ? Sparkles
                              : subItem.icon === "MessageSquare"
                              ? MessageSquare
                              : subItem.icon === "Newspaper"
                              ? Newspaper
                              : subItem.icon === "Cpu"
                              ? Cpu
                              : Compass;

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setDesktopDropdownOpen(null)}
                              className={cn(
                                "flex items-start gap-3 p-2.5 rounded-xl transition-all group/sub",
                                isSubActive
                                  ? "bg-accent/10 border border-accent/20"
                                  : "hover:bg-bg-elevated/80 border border-transparent"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-2 rounded-lg mt-0.5 transition-colors flex-shrink-0",
                                  isSubActive
                                    ? "bg-accent text-white"
                                    : "bg-bg-elevated text-accent group-hover/sub:bg-accent group-hover/sub:text-white"
                                )}
                              >
                                <SubIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span
                                    className={cn(
                                      "text-xs font-semibold tracking-tight",
                                      isSubActive ? "text-accent" : "text-text-primary group-hover/sub:text-accent"
                                    )}
                                  >
                                    {subItem.label}
                                  </span>
                                  {subItem.badge && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-muted text-accent">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                                {subItem.description && (
                                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1 leading-normal">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

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
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Search Trigger Button - Icon Kính Lúp Gọn Gàng */}
            {pathname !== "/" && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-search-modal"));
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-border bg-white dark:bg-bg-elevated/80 text-text-muted hover:text-accent hover:border-accent/50 transition-all shadow-sm cursor-pointer flex-shrink-0"
                aria-label={dict.header.searchButton}
                title={dict.header.searchButton}
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
              </button>
            )}

            {/* Desktop / Tablet: Segmented Pill Switcher */}
            <LanguageSwitcher variant="pill" className="hidden sm:inline-flex" />

            {/* Mobile: 1-Tap Compact Language Switcher */}
            <LanguageSwitcher variant="compact" className="sm:hidden" />

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors border border-transparent hover:border-border cursor-pointer flex-shrink-0"
              aria-label={darkMode ? dict.header.themeLight : dict.header.themeDark}
              title={darkMode ? dict.header.themeLight : dict.header.themeDark}
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

            {/* Nút Viết Bản Tin Nhanh (Hiển thị khi là Admin / Mentor Lab) -> Dẫn vào Bảng Quản Trị /admin */}
            {user && (user.role === "superadmin" || user.role === "admin") && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm shadow-accent/20 transition-all hover:scale-102"
                title={dict.header.adminDashboard}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{dict.header.publishPost}</span>
              </Link>
            )}

            {/* User Auth Profile / Login Button (Chỉ hiện trên Desktop lg:, trên Mobile được đưa vào menu 3 gạch) */}
            <div className="hidden lg:block">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-bg-elevated hover:border-accent/50 transition-all text-xs cursor-pointer"
                  >
                    <UserAvatar
                      avatar={user.avatar}
                      name={user.name}
                      role={user.role}
                      className="w-7 h-7 rounded-full border border-border"
                      textClassName="text-base"
                      size={28}
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-text-primary truncate max-w-[85px] xl:max-w-[130px]">
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
                              : user.role === "lab_member"
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      >
                        {user.role === "superadmin"
                          ? dict.common.roles.superadmin
                          : user.role === "admin"
                          ? dict.common.roles.admin
                          : user.role === "lab_member"
                          ? dict.common.roles.lab_member
                          : dict.common.roles.user}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-panel border border-border shadow-2xl p-2 z-50 animate-fade-in text-xs">
                      <div className="px-3 py-2.5 border-b border-border/80 mb-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text-primary truncate">{user.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-accent text-white">
                            Lv.{user.level || 1}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted font-mono truncate">{user.email}</div>
                      </div>

                      {(user.role === "superadmin" || user.role === "admin") && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-accent" />
                          <span>{dict.header.adminDashboard}</span>
                        </Link>
                      )}

                      {user.role === "superadmin" && (
                        <>
                          <Link
                            href="/admin/users"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-400" />
                            <span>{dict.header.memberManagement}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              setSecretPointModalOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors text-left font-semibold cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                              <span>{dict.header.secretPoints}</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-black">
                              {dict.header.hidden}
                            </span>
                          </button>
                        </>
                      )}

                      <Link
                        href="/ranking"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-amber-400 hover:bg-bg-elevated transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>{dict.header.leaderboard}</span>
                      </Link>

                      <Link
                        href="/roadmap"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>{dict.header.myRoadmap}</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-accent hover:bg-bg-elevated transition-colors border-t border-border/60 mt-1 font-medium"
                      >
                        <UserCheck className="w-4 h-4 text-accent" />
                        <span>{dict.header.profile}</span>
                      </Link>

                      <button
                        onClick={handleUserLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{dict.header.signOut}</span>
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
                    {dict.header.signIn}
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/60 cursor-pointer flex-shrink-0 z-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? dict.header.closeMenu : dict.header.openMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <SearchModal />
          <SuperAdminPointModal
            isOpen={secretPointModalOpen}
            onClose={() => setSecretPointModalOpen(false)}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-bg-panel/95 animate-slide-up space-y-4">
            {/* Language Switcher on Mobile */}
            <LanguageSwitcher variant="mobile" />

            {/* User Profile Card inside Mobile Drawer */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-bg-elevated/70 border border-border space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatar={user.avatar}
                    name={user.name}
                    role={user.role}
                    className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 shadow-sm"
                    textClassName="text-xl"
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text-primary truncate">
                        {user.name}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor:
                            user.role === "superadmin"
                              ? "rgba(168, 85, 247, 0.15)"
                              : user.role === "admin"
                              ? "rgba(240, 90, 40, 0.15)"
                              : user.role === "lab_member"
                              ? "rgba(6, 182, 212, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                          color:
                            user.role === "superadmin"
                              ? "#a855f7"
                              : user.role === "admin"
                              ? "#f05a28"
                              : user.role === "lab_member"
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      >
                        {user.role === "superadmin"
                          ? dict.common.roles.superadmin
                          : user.role === "admin"
                          ? dict.common.roles.admin
                          : user.role === "lab_member"
                          ? dict.common.roles.lab_member
                          : dict.common.roles.user}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-mono truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Account Action Buttons */}
                <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-border/70 text-xs">
                  {(user.role === "superadmin" || user.role === "admin") && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-bg-panel transition-colors font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent" />
                      <span>{dict.header.adminDashboard}</span>
                    </Link>
                  )}

                  {user.role === "superadmin" && (
                    <>
                      <Link
                        href="/admin/users"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-bg-panel transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <span>{dict.header.memberManagement}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setSecretPointModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors font-semibold text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                          <span>{dict.header.secretPointsGod}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-black">
                          {dict.header.hidden}
                        </span>
                      </button>
                    </>
                  )}

                  <Link
                    href="/ranking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-amber-400 hover:bg-bg-panel transition-colors font-semibold"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>{dict.header.leaderboard}</span>
                  </Link>

                  <Link
                    href="/roadmap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-bg-panel transition-colors font-semibold"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{dict.header.myRoadmap}</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-bg-panel transition-colors font-semibold"
                  >
                    <UserCheck className="w-4 h-4 text-accent" />
                    <span>{dict.header.profile}</span>
                  </Link>

                  <button
                    onClick={handleUserLogout}
                    className="flex items-center gap-2 p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-semibold text-left mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{dict.header.signOut}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-bg-elevated/70 border border-border">
                <Button variant="pill" className="w-full bg-accent text-white font-bold" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-1.5" />
                    {dict.header.signIn} / {dict.header.signUp}
                  </Link>
                </Button>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted px-2 block mb-1">
                {dict.nav.categoriesNav}
              </span>
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  if (item.items && item.items.length > 0) {
                    const isGroupActive = item.items.some(
                      (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                    );
                    const isSubOpen = Boolean(mobileDropdownsOpen[item.href] ?? mobileDropdownsOpen[item.label]);

                    return (
                      <div key={item.label} className="space-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setMobileDropdownsOpen((prev) => ({
                              ...prev,
                              [item.href]: !(prev[item.href] ?? prev[item.label]),
                              [item.label]: !(prev[item.href] ?? prev[item.label]),
                            }))
                          }
                          className={cn(
                            "w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between text-left cursor-pointer",
                            isGroupActive
                              ? "text-accent bg-accent-muted/40 font-bold border border-accent/30"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span>{item.label}</span>
                            {isGroupActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 text-text-muted transition-transform duration-200",
                              isSubOpen ? "rotate-180 text-accent" : ""
                            )}
                          />
                        </button>
                        {isSubOpen && (
                          <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-accent/30 ml-3 animate-fade-in">
                            {item.items.map((subItem) => {
                              const isSubActive =
                                pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                              const SubIcon =
                                subItem.icon === "BookOpen"
                                  ? BookOpen
                                  : subItem.icon === "Route"
                                  ? Route
                                  : subItem.icon === "GraduationCap"
                                  ? GraduationCap
                                  : subItem.icon === "Sparkles"
                                  ? Sparkles
                                  : subItem.icon === "MessageSquare"
                                  ? MessageSquare
                                  : subItem.icon === "Newspaper"
                                  ? Newspaper
                                  : subItem.icon === "Cpu"
                                  ? Cpu
                                  : Compass;

                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                                    isSubActive
                                      ? "text-accent bg-accent-muted/30 font-bold border border-accent/20"
                                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                                  )}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <SubIcon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                    <span>{subItem.label}</span>
                                  </span>
                                  {subItem.badge && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent font-semibold">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between",
                        isActive
                          ? "text-accent bg-accent-muted/40 font-bold border border-accent/30"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}