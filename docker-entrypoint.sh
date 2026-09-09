#!/bin/sh
set -e

# Đảm bảo thư mục SQLite database và uploads tồn tại, có đầy đủ quyền ghi cho user nextjs (UID 1001)
mkdir -p /app/prisma /app/public/uploads
chown -R nextjs:nodejs /app/prisma /app/public/uploads
chmod -R 775 /app/prisma /app/public/uploads

# Tự động đồng bộ schema SQLite với Prisma schema mới nhất (thêm cột mới, bảng mới mà không mất dữ liệu)
echo "[Entrypoint] Kiểm tra và đồng bộ schema SQLite..."
su-exec nextjs npx prisma db push --skip-generate || true
chown -R nextjs:nodejs /app/prisma /app/public/uploads || true
chmod -R 775 /app/prisma /app/public/uploads || true

# Thực thi ứng dụng dưới quyền user nextjs
exec su-exec nextjs "$@"
