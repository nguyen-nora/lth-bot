#!/bin/bash

# LHT-Bot Deploy Script
# Script tự động hóa việc deploy bot lên server

set -e  # Dừng script nếu có lỗi

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cấu hình mặc định
SERVER_USER="root"
SERVER_HOST="157.245.53.128"
SERVER_PATH="/opt/lth-bot"
LOCAL_PATH="."

echo "=========================================="
echo "  LHT-Bot Deploy Script"
echo "=========================================="
echo ""
echo "Server: ${SERVER_USER}@${SERVER_HOST}"
echo "Path: ${SERVER_PATH}"
echo ""

# Kiểm tra SSH connection
echo "Bước 1: Kiểm tra kết nối SSH..."
if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'Connected'" 2>/dev/null; then
    echo -e "${GREEN}✓ Kết nối SSH thành công${NC}"
else
    echo -e "${RED}✗ Không thể kết nối SSH${NC}"
    echo "Vui lòng kiểm tra:"
    echo "  - SSH key đã được thêm vào server"
    echo "  - Hoặc password authentication được bật"
    exit 1
fi

# Kiểm tra Node.js trên server
echo ""
echo "Bước 2: Kiểm tra Node.js trên server..."
if ssh ${SERVER_USER}@${SERVER_HOST} "command -v node" > /dev/null 2>&1; then
    NODE_VERSION=$(ssh ${SERVER_USER}@${SERVER_HOST} "node --version")
    echo -e "${GREEN}✓ Node.js đã được cài đặt: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}Node.js chưa được cài đặt trên server${NC}"
    read -p "Bạn có muốn cài đặt Node.js 20.x không? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Đang cài đặt Node.js..."
        ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
apt update
apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
ENDSSH
        echo -e "${GREEN}✓ Node.js đã được cài đặt${NC}"
    else
        echo -e "${RED}Vui lòng cài đặt Node.js trước khi tiếp tục${NC}"
        exit 1
    fi
fi

# Tạo thư mục trên server
echo ""
echo "Bước 3: Tạo thư mục trên server..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"
echo -e "${GREEN}✓ Thư mục đã được tạo${NC}"

# Upload code (sử dụng rsync hoặc scp)
echo ""
echo "Bước 4: Upload code lên server..."
echo "Đang sync files..."

# Sử dụng rsync nếu có, nếu không dùng scp
if command -v rsync &> /dev/null; then
    rsync -avz --exclude 'node_modules' \
              --exclude 'dist' \
              --exclude '.env' \
              --exclude 'data' \
              --exclude '.git' \
              --exclude 'coverage' \
              --exclude '*.log' \
              ${LOCAL_PATH}/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
    echo -e "${GREEN}✓ Code đã được upload${NC}"
else
    echo -e "${YELLOW}rsync không được tìm thấy, sử dụng scp...${NC}"
    echo "Vui lòng upload code thủ công qua SFTP hoặc cài đặt rsync"
fi

# Chạy setup trên server
echo ""
echo "Bước 5: Thiết lập trên server..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
set -e
cd ${SERVER_PATH}

echo "Đang cài đặt dependencies..."
npm install --production

echo "Tạo thư mục data..."
mkdir -p data

echo "Generate Prisma Client..."
npm run prisma:generate

echo "Chạy migrations..."
npm run prisma:migrate:deploy

echo "Build project..."
npm run build

echo "✓ Setup hoàn tất trên server"
ENDSSH

# Kiểm tra file .env
echo ""
echo "Bước 6: Kiểm tra file .env..."
if ssh ${SERVER_USER}@${SERVER_HOST} "test -f ${SERVER_PATH}/.env"; then
    echo -e "${GREEN}✓ File .env đã tồn tại${NC}"
    
    # Kiểm tra DISCORD_TOKEN
    if ssh ${SERVER_USER}@${SERVER_HOST} "grep -q 'DISCORD_TOKEN=your_discord_bot_token_here' ${SERVER_PATH}/.env 2>/dev/null || ! grep -q 'DISCORD_TOKEN=' ${SERVER_PATH}/.env"; then
        echo -e "${YELLOW}⚠ Cảnh báo: DISCORD_TOKEN có vẻ chưa được cấu hình đúng${NC}"
        echo "Vui lòng chỉnh sửa file .env trên server:"
        echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
        echo "  nano ${SERVER_PATH}/.env"
    fi
else
    echo -e "${YELLOW}File .env chưa tồn tại${NC}"
    echo "Đang tạo file .env..."
    ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cat > ${SERVER_PATH}/.env << 'EOF'
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here

# Database Configuration
DATABASE_URL="file:./data/database.sqlite"
EOF
chmod 600 ${SERVER_PATH}/.env
ENDSSH
    echo -e "${GREEN}✓ File .env đã được tạo${NC}"
    echo -e "${YELLOW}⚠ QUAN TRỌNG: Vui lòng chỉnh sửa file .env và thêm DISCORD_TOKEN!${NC}"
    echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "  nano ${SERVER_PATH}/.env"
fi

# Tạo systemd service
echo ""
echo "Bước 7: Tạo systemd service..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cat > /etc/systemd/system/lht-bot.service << 'EOF'
[Unit]
Description=LHT Discord Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${SERVER_PATH}
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node ${SERVER_PATH}/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable lht-bot
echo "✓ Systemd service đã được tạo"
ENDSSH

# Khởi động bot
echo ""
read -p "Bạn có muốn khởi động bot ngay bây giờ không? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Đang khởi động bot..."
    ssh ${SERVER_USER}@${SERVER_HOST} "systemctl start lht-bot"
    
    # Đợi một chút rồi kiểm tra status
    sleep 2
    ssh ${SERVER_USER}@${SERVER_HOST} "systemctl status lht-bot --no-pager -n 10"
    
    echo ""
    echo -e "${GREEN}✓ Bot đã được khởi động${NC}"
    echo ""
    echo "Để xem logs:"
    echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "  journalctl -u lht-bot -f"
else
    echo ""
    echo "Để khởi động bot sau:"
    echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "  systemctl start lht-bot"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Deploy hoàn tất!${NC}"
echo "=========================================="
echo ""
echo "Các lệnh hữu ích:"
echo "  # Xem logs"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'journalctl -u lht-bot -f'"
echo ""
echo "  # Kiểm tra status"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'systemctl status lht-bot'"
echo ""
echo "  # Restart bot"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'systemctl restart lht-bot'"
echo ""
