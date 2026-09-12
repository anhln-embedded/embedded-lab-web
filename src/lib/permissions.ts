import { normalizeEmail, parseEmailList } from "./utils";

export interface PermissionUser {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

export interface ContentAuthor {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

/**
 * Lấy danh sách email SuperAdmin cấu hình từ biến môi trường
 */
export function getSuperAdminEmails(): string[] {
  const envRaw =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ||
        process.env.SUPER_ADMIN_EMAILS)) ||
    "anhln.embedded@gmail.com,anhlnembedded@gmail.com";
  return parseEmailList(envRaw);
}

/**
 * Kiểm tra xem một email hoặc đối tượng người dùng có phải là Superadmin hay không
 */
export function isSuperAdmin(userOrEmail?: PermissionUser | string | null): boolean {
  if (!userOrEmail) return false;

  if (typeof userOrEmail === "string") {
    const clean = normalizeEmail(userOrEmail);
    if (!clean) return false;
    return getSuperAdminEmails().includes(clean);
  }

  if (userOrEmail.role === "superadmin") return true;

  if (userOrEmail.email) {
    const clean = normalizeEmail(userOrEmail.email);
    if (getSuperAdminEmails().includes(clean)) return true;
  }

  return false;
}

/**
 * Kiểm tra xem một người dùng có phải là Admin hoặc Superadmin hay không
 */
export function isAdminOrSuperAdmin(userOrEmail?: PermissionUser | string | null): boolean {
  if (!userOrEmail) return false;
  if (isSuperAdmin(userOrEmail)) return true;

  if (typeof userOrEmail === "object") {
    return userOrEmail.role === "admin" || userOrEmail.role === "superadmin";
  }

  return false;
}

/**
 * Kiểm tra xem người dùng hiện tại có phải là chính tác giả của bài viết/nội dung không
 */
export function isContentAuthor(
  user?: PermissionUser | null,
  author?: ContentAuthor | null
): boolean {
  if (!user || !author) return false;

  // 1. Khớp theo email (chính xác nhất)
  if (user.email && author.email) {
    if (normalizeEmail(user.email) === normalizeEmail(author.email)) {
      return true;
    }
  }

  // 2. Khớp theo ID người dùng
  if (user.id && author.id && user.id === author.id) {
    return true;
  }

  // 3. Khớp theo tên tác giả (chuẩn hóa viết thường)
  if (user.name && author.name) {
    const cleanUserName = user.name.trim().toLowerCase();
    const cleanAuthorName = author.name.trim().toLowerCase();
    if (cleanUserName === cleanAuthorName && cleanUserName.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Quy tắc cốt lõi: Kiểm tra quyền xóa bài viết/nội dung
 *
 * Quy định:
 * 1. Superadmin: Toàn quyền xóa bất kỳ nội dung nào.
 * 2. Admin:
 *    - ĐƯỢC xóa nội dung do CHÍNH MÌNH tạo (isContentAuthor).
 *    - KHÔNG ĐƯỢC xóa nội dung của các Admin khác hoặc Superadmin.
 *    - Được phép kiểm duyệt/xóa bài của người dùng thông thường (role: user, lab_member) nếu là diễn đàn thảo luận.
 * 3. User thông thường: Chỉ được xóa nội dung do chính mình tạo (ví dụ: bài thảo luận hoặc bình luận của chính mình).
 */
export function canUserDeleteContent(params: {
  currentUser?: PermissionUser | null;
  author?: ContentAuthor | null;
  isDiscussionOrComment?: boolean;
}): { allowed: boolean; reason?: string } {
  const { currentUser, author, isDiscussionOrComment = false } = params;

  if (!currentUser) {
    return {
      allowed: false,
      reason: "Bạn cần đăng nhập để thực hiện thao tác này.",
    };
  }

  // 1. Superadmin có toàn quyền tuyệt đối
  if (isSuperAdmin(currentUser)) {
    return { allowed: true };
  }

  // 2. Kiểm tra xem người dùng hiện tại có chính là tác giả không
  const isAuthor = isContentAuthor(currentUser, author);
  if (isAuthor) {
    return { allowed: true };
  }

  // 3. Nếu là Admin thường (role === "admin")
  if (currentUser.role === "admin") {
    // Nếu bài viết thuộc về một Admin khác hoặc Superadmin
    const authorIsAdminOrSuper =
      author?.role === "admin" ||
      author?.role === "superadmin" ||
      (author?.email ? isSuperAdmin(author.email) : false);

    if (authorIsAdminOrSuper) {
      return {
        allowed: false,
        reason:
          "Quản trị viên không thể xóa bài viết của Quản trị viên khác. Chỉ Superadmin hoặc chính tác giả mới có quyền xóa.",
      };
    }

    // Nếu không có thông tin role nhưng tác giả là người khác trong môi trường bài viết/chuyên đề quản trị
    if (!isDiscussionOrComment) {
      // Trong bài viết bản tin, chuyên đề học tập, bài báo nghiên cứu:
      // Các nội dung này do các Quản trị viên phụ trách, nên nếu không phải bài của mình -> Không được xóa
      return {
        allowed: false,
        reason:
          "Bạn không phải là tác giả của bài viết này. Chỉ Superadmin hoặc chính tác giả mới có quyền xóa.",
      };
    }

    // Trong diễn đàn thảo luận / bình luận: Admin được phép xóa/kiểm duyệt bài của thành viên thông thường
    return { allowed: true };
  }

  // 4. Người dùng thông thường (student, lab_member, user)
  return {
    allowed: false,
    reason: "Bạn không có đặc quyền để xóa bài viết này.",
  };
}
