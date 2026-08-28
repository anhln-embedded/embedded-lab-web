#!/usr/bin/env bash

# ==============================================================================
# Script quản lý Docker & Tự động cập nhật (CI/CD Local) cho Embedded Lab Web
# ==============================================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Thư mục gốc của dự án
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    PROJECT_DIR="$SCRIPT_DIR"
else
    PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

cd "$PROJECT_DIR" || exit 1

print_header() {
    echo -e "${CYAN}=====================================================${NC}"
    echo -e "${CYAN}   Quản Lý Web Embedded Lab (Docker CI/CD Local)    ${NC}"
    echo -e "${CYAN}   Tên miền: embedded-aiot.com                      ${NC}"
    echo -e "${CYAN}=====================================================${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Lỗi: Docker chưa được cài đặt hoặc chưa khởi chạy!${NC}"
        exit 1
    fi
}

ensure_containers_up() {
    echo -e "${CYAN}[📦] Đang khởi chạy / Rebuild container web...${NC}"
    if ! docker compose up -d --build --remove-orphans; then
        echo -e "${YELLOW}[!] Phát hiện xung đột container cũ, đang dọn dẹp...${NC}"
        docker rm -f embedded_lab_web 2>/dev/null || true
        docker compose up -d --build --remove-orphans
    fi
}

sync_database() {
    echo -e "${CYAN}[🗄️] Đang đồng bộ hóa Database Schema (Prisma db push)...${NC}"
    docker exec -u 0 -e HOME=/tmp embedded_lab_web npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true
}

start_app() {
    echo -e "${GREEN}[+] Đang khởi chạy hệ thống Embedded Lab Web...${NC}"
    ensure_containers_up
    sync_database
    echo -e "${GREEN}[✔] Khởi chạy thành công!${NC}"
    docker compose ps
}

stop_app() {
    echo -e "${YELLOW}[-] Đang tạm dừng các container...${NC}"
    docker compose stop
    echo -e "${GREEN}[✔] Đã dừng toàn bộ container.${NC}"
}

down_app() {
    echo -e "${RED}[!] Đang dừng và xóa sạch container/network...${NC}"
    docker compose down
    echo -e "${GREEN}[✔] Đã dọn dẹp sạch sẽ.${NC}"
}

restart_app() {
    echo -e "${CYAN}[🔍] Kiểm tra bản cập nhật mới nhất từ Git (nhánh master)...${NC}"
    git fetch origin master

    LOCAL_HASH=$(git rev-parse HEAD 2>/dev/null)
    REMOTE_HASH=$(git rev-parse origin/master 2>/dev/null || echo "unknown")

    if [ "$LOCAL_HASH" != "$REMOTE_HASH" ] && [ "$REMOTE_HASH" != "unknown" ]; then
        echo -e "${YELLOW}[🚀] Phát hiện code mới trên master! Đang kéo code mới...${NC}"
        git pull origin master
        if [ "$IS_REEXECUTED" != "true" ]; then
            echo -e "${CYAN}[🔄] Khởi động lại script với code mới...${NC}"
            export IS_REEXECUTED="true"
            exec "$0" restart
        fi
        echo -e "${GREEN}[🔄] Đang build và khởi chạy lại container với code mới...${NC}"
        ensure_containers_up
        sync_database
        echo -e "${GREEN}[✔] Đã cập nhật và chạy phiên bản mới thành công!${NC}"
    else
        echo -e "${GREEN}[ℹ] Code local đã là mới nhất. Đang build & restart container...${NC}"
        ensure_containers_up
        sync_database
        echo -e "${GREEN}[✔] Đã restart các container thành công!${NC}"
    fi
}

status_app() {
    echo -e "${CYAN}[📊] Trạng thái container:${NC}"
    docker compose ps
}

logs_app() {
    echo -e "${CYAN}[📜] Theo dõi log ứng dụng web (Nhấn Ctrl+C để thoát):${NC}"
    docker compose logs -f app
}

backup_app() {
    echo -e "${CYAN}[📦] Đang tạo bản sao lưu dữ liệu Embedded Lab...${NC}"

    BACKUP_DIR="$PROJECT_DIR/backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    TEMP_DIR=$(mktemp -d)
    BACKUP_NAME="embedded_backup_${TIMESTAMP}"

    mkdir -p "$BACKUP_DIR"

    # 1. Sao lưu SQLite Database (dev.db)
    echo -e "${CYAN}  [1/3] Đang sao lưu Database SQLite...${NC}"
    if [ -f "$PROJECT_DIR/prisma/dev.db" ]; then
        cp "$PROJECT_DIR/prisma/dev.db" "$TEMP_DIR/dev.db"
        echo -e "${GREEN}  [✔] Database SQLite đã sao lưu (${PROJECT_DIR}/prisma/dev.db)${NC}"
    else
        # Thử lấy từ container nếu local chưa mount
        docker cp embedded_lab_web:/app/prisma/dev.db "$TEMP_DIR/dev.db" 2>/dev/null || true
        if [ -f "$TEMP_DIR/dev.db" ]; then
            echo -e "${GREEN}  [✔] Database SQLite đã sao lưu từ container${NC}"
        else
            echo -e "${YELLOW}  [!] Không tìm thấy file dev.db, bỏ qua DB${NC}"
        fi
    fi

    # 2. Sao lưu file cấu hình .env
    echo -e "${CYAN}  [2/3] Đang sao lưu file cấu hình .env...${NC}"
    if [ -f "$PROJECT_DIR/.env" ]; then
        cp "$PROJECT_DIR/.env" "$TEMP_DIR/.env"
        echo -e "${GREEN}  [✔] .env đã sao lưu${NC}"
    else
        echo -e "${YELLOW}  [!] Không tìm thấy file .env, bỏ qua${NC}"
    fi

    # 3. Sao lưu thư mục .cloudflared (nếu có)
    echo -e "${CYAN}  [3/3] Đang sao lưu thư mục .cloudflared/...${NC}"
    if [ -d "$PROJECT_DIR/.cloudflared" ]; then
        cp -r "$PROJECT_DIR/.cloudflared" "$TEMP_DIR/.cloudflared"
        echo -e "${GREEN}  [✔] .cloudflared/ đã sao lưu${NC}"
    else
        echo -e "${YELLOW}  [!] Không tìm thấy thư mục .cloudflared/, bỏ qua${NC}"
    fi

    # 4. Nén tất cả thành 1 file tar.gz
    BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    tar -czf "$BACKUP_FILE" -C "$TEMP_DIR" .
    rm -rf "$TEMP_DIR"

    FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e ""
    echo -e "${GREEN}=====================================================${NC}"
    echo -e "${GREEN}[✔] Sao lưu hoàn tất!${NC}"
    echo -e "${GREEN}  File: ${BACKUP_FILE}${NC}"
    echo -e "${GREEN}  Kích thước: ${FILESIZE}${NC}"
    echo -e "${GREEN}=====================================================${NC}"
}

restore_app() {
    BACKUP_FILE="$1"

    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}[!] Thiếu tham số file backup!${NC}"
        echo -e "Cách dùng: ${YELLOW}./scripts/manage.sh restore backups/embedded_backup_YYYYMMDD_HHMMSS.tar.gz${NC}"
        if [ -d "$PROJECT_DIR/backups" ] && [ "$(ls -A $PROJECT_DIR/backups/*.tar.gz 2>/dev/null)" ]; then
            echo -e ""
            echo -e "${CYAN}Các bản backup có sẵn:${NC}"
            ls -lh "$PROJECT_DIR/backups/"*.tar.gz 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}'
        fi
        return 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}[!] File backup không tồn tại: ${BACKUP_FILE}${NC}"
        return 1
    fi

    echo -e "${CYAN}[📦] Đang khôi phục dữ liệu từ: ${BACKUP_FILE}${NC}"

    TEMP_DIR=$(mktemp -d)
    tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

    # 1. Restore .env
    if [ -f "$TEMP_DIR/.env" ]; then
        echo -e "${CYAN}  [1/3] Đang khôi phục file .env...${NC}"
        cp "$TEMP_DIR/.env" "$PROJECT_DIR/.env"
        echo -e "${GREEN}  [✔] .env đã khôi phục${NC}"
    fi

    # 2. Restore .cloudflared/
    if [ -d "$TEMP_DIR/.cloudflared" ]; then
        echo -e "${CYAN}  [2/3] Đang khôi phục thư mục .cloudflared/...${NC}"
        mkdir -p "$PROJECT_DIR/.cloudflared"
        cp -r "$TEMP_DIR/.cloudflared/"* "$PROJECT_DIR/.cloudflared/"
        echo -e "${GREEN}  [✔] .cloudflared/ đã khôi phục${NC}"
    fi

    # 3. Restore Database SQLite
    if [ -f "$TEMP_DIR/dev.db" ]; then
        echo -e "${CYAN}  [3/3] Đang khôi phục SQLite database...${NC}"
        mkdir -p "$PROJECT_DIR/prisma"
        cp "$TEMP_DIR/dev.db" "$PROJECT_DIR/prisma/dev.db"
        # Đẩy vào container nếu container đang chạy
        docker cp "$TEMP_DIR/dev.db" embedded_lab_web:/app/prisma/dev.db 2>/dev/null || true
        echo -e "${GREEN}  [✔] Database SQLite đã khôi phục thành công!${NC}"
    fi

    rm -rf "$TEMP_DIR"

    echo -e ""
    echo -e "${GREEN}=====================================================${NC}"
    echo -e "${GREEN}[✔] Khôi phục hoàn tất!${NC}"
    echo -e "  Chạy: ./scripts/manage.sh start để khởi chạy ứng dụng${NC}"
    echo -e "${GREEN}=====================================================${NC}"
}

show_menu() {
    print_header
    echo -e " Vui lòng chọn thao tác:"
    echo -e " ${GREEN}1)${NC} Start (Khởi chạy Docker Web)"
    echo -e " ${YELLOW}2)${NC} Stop (Tạm dừng container)"
    echo -e " ${CYAN}3)${NC} Restart & Update (Kéo code master mới & rebuild)"
    echo -e " ${RED}4)${NC} Down (Dừng và xóa container)"
    echo -e " ${CYAN}5)${NC} Status (Kiểm tra trạng thái)"
    echo -e " ${CYAN}6)${NC} Logs (Xem log ứng dụng web)"
    echo -e " ${GREEN}7)${NC} Backup (Sao lưu SQLite DB + .env)"
    echo -e " ${YELLOW}8)${NC} Restore (Khôi phục từ file backup)"
    echo -e " ${RED}0)${NC} Thoát"
    echo -e "${CYAN}-----------------------------------------------------${NC}"
    read -p "Nhập lựa chọn của bạn [0-8]: " choice
    case $choice in
        1) start_app ;;
        2) stop_app ;;
        3) restart_app ;;
        4) down_app ;;
        5) status_app ;;
        6) logs_app ;;
        7) backup_app ;;
        8)
            read -p "Nhập đường dẫn file backup: " bfile
            restore_app "$bfile"
            ;;
        0) exit 0 ;;
        *) echo -e "${RED}Lựa chọn không hợp lệ!${NC}" ;;
    esac
}

check_docker

case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    down)
        down_app
        ;;
    restart|update)
        restart_app
        ;;
    status)
        status_app
        ;;
    logs)
        logs_app
        ;;
    backup)
        backup_app
        ;;
    restore)
        restore_app "$2"
        ;;
    *)
        show_menu
        ;;
esac
