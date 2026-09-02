#!/bin/sh
set -e

# Đảm bảo thư mục SQLite database và uploads tồn tại, có đầy đủ quyền ghi cho user nextjs (UID 1001)
mkdir -p /app/prisma /app/public/uploads
chown -R nextjs:nodejs /app/prisma /app/public/uploads
chmod -R 775 /app/prisma /app/public/uploads

# Khởi tạo schema SQLite nếu chưa có database file
if [ ! -f /app/prisma/dev.db ]; then
  echo "[Entrypoint] Khởi tạo cơ sở dữ liệu SQLite ban đầu..."
  su-exec nextjs npx prisma db push --skip-generate || true
fi

# Thực thi ứng dụng dưới quyền user nextjs
exec su-exec nextjs "$@"
