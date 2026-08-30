"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  ShieldCheck,
  Edit3,
  GraduationCap,
  Users,
  ArrowLeft,
  Trash2,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function AdminUsersPage() {
  const { user, allUsers, updateUserRole, deleteUser, register, quickLogin } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [message, setMessage] = useState("");

  const isSuperAdmin = user && user.role === "superadmin";

  if (!isSuperAdmin) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className="p-8 rounded-2xl bg-bg-panel border border-border shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20 text-3xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Yêu cầu Quyền Super Admin
          </h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Chỉ <strong>Super Admin</strong> tối cao mới có quyền truy cập quản lý danh sách thành viên và phân quyền trong hệ thống.
          </p>

          <Button variant="primary" asChild className="bg-accent hover:bg-accent-hover text-white">
            <Link href="/admin">Quay lại Bảng Quản Trị</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setMessage("Vui lòng điền đủ họ tên và email.");
      return;
    }

    const res = register(newName, newEmail, "123456", newRole);
    if (!res.success) {
      setMessage(res.message || "Không thể tạo tài khoản.");
    } else {
      setMessage("Đã thêm thành viên mới thành công!");
      setNewName("");
      setNewEmail("");
      setTimeout(() => {
        setShowAddModal(false);
        setMessage("");
      }, 1000);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="text-text-muted hover:text-text-primary mb-2">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Quay lại Bảng Quản Trị
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Quản Lý Thành Viên & Phân Quyền
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Super Admin
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Thêm Thành Viên Mới
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-bg-panel border border-border/80 rounded-2xl p-6 shadow-md">
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Danh sách người dùng ({allUsers.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-text-muted font-semibold bg-bg-elevated/50">
              <tr>
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Vai trò hiện tại</th>
                <th className="py-3 px-4">Thay đổi quyền (Role)</th>
                <th className="py-3 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {allUsers.map((u) => {
                const isCurrent = user?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          avatar={u.avatar}
                          name={u.name}
                          role={u.role}
                          className="w-8 h-8 rounded-lg bg-bg-elevated border border-border shadow-inner"
                          textClassName="text-sm"
                          size={32}
                        />
                        <div>
                          <span className="font-semibold text-text-primary block">
                            {u.name}
                            {isCurrent && (
                              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-accent-muted text-accent">
                                Bạn
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-text-muted">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-text-secondary font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === "superadmin"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : u.role === "admin"
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {u.role === "superadmin" && <ShieldCheck className="w-3 h-3" />}
                        {u.role === "admin" && <Edit3 className="w-3 h-3" />}
                        {u.role === "user" && <GraduationCap className="w-3 h-3" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        <option value="user">User (Sinh viên)</option>
                        <option value="admin">Admin (Đăng bài)</option>
                        <option value="superadmin">Super Admin (Tối cao)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa tài khoản ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-panel border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Thêm Thành Viên Mới
            </h3>

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-accent-muted text-accent text-xs font-medium border border-accent/20">
                {message}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nguyễn Văn B"
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@ptit.edu.vn"
                  required
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Vai trò phân quyền
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="user">User (Sinh viên / Độc giả)</option>
                  <option value="admin">Admin (Tác giả đăng bài)</option>
                  <option value="superadmin">Super Admin (Quản trị tối cao)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Thêm thành viên
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
