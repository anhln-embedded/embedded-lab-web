#!/bin/sh
set -e

# Đảm bảo thư mục SQLite database và uploads tồn tại, có đầy đủ quyền ghi cho user nextjs (UID 1001)
mkdir -p /app/prisma /app/public/uploads
chown -R nextjs:nodejs /app/prisma /app/public/uploads
chmod -R 775 /app/prisma /app/public/uploads

# Tự động đồng bộ schema SQLite với Prisma schema mới nhất (thêm cột mới, bảng mới mà không mất dữ liệu)
echo "[Entrypoint] Kiểm tra và đồng bộ schema SQLite..."
export HOME=/tmp
export DATABASE_URL="${DATABASE_URL:-file:/app/prisma/dev.db}"
if [ -f "/app/node_modules/.bin/prisma" ]; then
    /app/node_modules/.bin/prisma db push --skip-generate --accept-data-loss || true
else
    npx prisma db push --skip-generate --accept-data-loss || true
fi
chown -R nextjs:nodejs /app/prisma /app/public/uploads || true
chmod -R 775 /app/prisma /app/public/uploads || true

# Thực thi ứng dụng dưới quyền user nextjs
exec su-exec nextjs "$@"
