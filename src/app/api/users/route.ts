import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeEmail, parseEmailList } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getSuperAdminEmailsFromEnv(): string[] {
  const envAdmins =
    process.env.SUPER_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
    "anhln.embedded@gmail.com,anhlnembedded@gmail.com";
  return parseEmailList(envAdmins);
}

// GET /api/users - Fetch all users from SQLite Database
export async function GET() {
  try {
    let users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const superAdminEmails = getSuperAdminEmailsFromEnv();

    // If database has no users yet, seed the primary Super Admin
    if (users.length === 0) {
      const primaryEmail = superAdminEmails[0] || "anhln.embedded@gmail.com";
      const created = await prisma.user.create({
        data: {
          email: primaryEmail,
          name: "Super Admin (Embedded AIoT Lab)",
          role: "superadmin",
          avatar: "🛡️",
          title: "Quản trị viên tối cao hệ thống Embedded AIoT Laboratory PTIT",
        },
      });
      users = [created];
    }

    // Map Prisma User format to AuthContext User format
    const formatted = users.map((u) => {
      let role = u.role;
      if (role === "student") role = "user";
      if (role === "mentor") role = "admin";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: role as "superadmin" | "admin" | "user",
        avatar: u.avatar || (role === "superadmin" ? "🛡️" : role === "admin" ? "✍️" : "🎓"),
        bio: u.title || (role === "superadmin" ? "Super Admin Lab PTIT" : "Thành viên Lab PTIT"),
        createdAt: u.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user in Database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, avatar, title } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Tên và email không được để trống." },
        { status: 400 }
      );
    }

    const cleanEmail = normalizeEmail(email);
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email này đã tồn tại trong hệ thống." },
        { status: 409 }
      );
    }

    const superAdminEmails = getSuperAdminEmailsFromEnv();
    const assignedRole = superAdminEmails.includes(cleanEmail) ? "superadmin" : (role || "user");

    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        role: assignedRole,
        avatar: avatar || (assignedRole === "superadmin" ? "🛡️" : assignedRole === "admin" ? "✍️" : "🎓"),
        title: title || (assignedRole === "superadmin" ? "Super Admin Lab PTIT" : "Thành viên Lab PTIT"),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        avatar: created.avatar,
        bio: created.title,
        createdAt: created.createdAt.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user role / info
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role, name, title, avatar } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name.trim();
    if (title !== undefined) updateData.title = title;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        bio: updated.title,
        createdAt: updated.createdAt.toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete user from Database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      // Also support JSON body
      const body = await request.json().catch(() => ({}));
      if (!body.id) {
        return NextResponse.json(
          { success: false, error: "User ID is required." },
          { status: 400 }
        );
      }
      return handleDelete(body.id);
    }

    return handleDelete(id);
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

async function handleDelete(id: string) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy người dùng cần xóa." },
      { status: 404 }
    );
  }

  // Prevent deleting the primary configured Super Admin
  const superAdminEmails = getSuperAdminEmailsFromEnv();
  const normalizedTargetEmail = normalizeEmail(target.email);
  if (superAdminEmails.length > 0 && normalizedTargetEmail === superAdminEmails[0]) {
    return NextResponse.json(
      { success: false, error: "Không thể xóa tài khoản Super Admin chính của hệ thống." },
      { status: 403 }
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: `Đã xóa người dùng ${target.name} (${target.email}) thành công.`,
  });
}
