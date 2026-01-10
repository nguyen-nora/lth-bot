#!/bin/bash

# LHT-Bot Ubuntu Setup Script
# Script tự động hóa việc thiết lập bot trên Ubuntu

set -e  # Dừng script nếu có lỗi

echo "=========================================="
echo "  LHT-Bot Ubuntu Setup Script"
echo "=========================================="
echo ""

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra quyền root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Không chạy script này với quyền root/sudo${NC}"
   exit 1
fi

# Kiểm tra Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    echo -e "${YELLOW}Cảnh báo: Script này được thiết kế cho Ubuntu/Debian${NC}"
fi

echo "Bước 1: Kiểm tra Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js đã được cài đặt: $NODE_VERSION${NC}"
    
    # Kiểm tra version
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}✗ Node.js version phải >= 18.0.0${NC}"
        echo "Vui lòng cài đặt Node.js 18 hoặc 20"
        exit 1
    fi
else
    echo -e "${YELLOW}Node.js chưa được cài đặt${NC}"
    echo "Đang cài đặt Node.js 20.x..."
    
    # Cài đặt Node.js từ NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo -e "${GREEN}✓ Node.js đã được cài đặt${NC}"
fi

echo ""
echo "Bước 2: Kiểm tra npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm đã được cài đặt: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm không được tìm thấy${NC}"
    exit 1
fi

echo ""
echo "Bước 3: Cài đặt dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Đang chạy npm install..."
    npm install
    echo -e "${GREEN}✓ Dependencies đã được cài đặt${NC}"
else
    echo -e "${GREEN}✓ node_modules đã tồn tại${NC}"
    echo "Đang cập nhật dependencies..."
    npm install
fi

echo ""
echo "Bước 4: Tạo thư mục data..."
mkdir -p data
echo -e "${GREEN}✓ Thư mục data đã được tạo${NC}"

echo ""
echo "Bước 5: Kiểm tra file .env..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}File .env chưa tồn tại${NC}"
    echo "Đang tạo file .env từ template..."
    
    cat > .env << EOF
# Discord Bot Configuration
# Lấy token từ: https://discord.com/developers/applications
DISCORD_TOKEN=your_discord_bot_token_here

# Database Configuration
DATABASE_URL="file:./data/database.sqlite"

# Optional: Guild ID for faster command registration during development
# GUILD_ID=your_guild_id_here

# Optional: Super Admin User ID
# SUPER_ADMIN=your_user_id_here

# Optional: Rate Limiting (default: true)
# RATE_LIMIT=true
EOF
    
    echo -e "${GREEN}✓ File .env đã được tạo${NC}"
    echo -e "${YELLOW}⚠ QUAN TRỌNG: Vui lòng chỉnh sửa file .env và thêm DISCORD_TOKEN của bạn!${NC}"
else
    echo -e "${GREEN}✓ File .env đã tồn tại${NC}"
    
    # Kiểm tra xem có DISCORD_TOKEN chưa
    if grep -q "DISCORD_TOKEN=your_discord_bot_token_here" .env || ! grep -q "DISCORD_TOKEN=" .env; then
        echo -e "${YELLOW}⚠ Cảnh báo: DISCORD_TOKEN có vẻ chưa được cấu hình đúng${NC}"
    fi
fi

echo ""
echo "Bước 6: Generate Prisma Client..."
npm run prisma:generate
echo -e "${GREEN}✓ Prisma Client đã được generate${NC}"

echo ""
echo "Bước 7: Chạy database migrations..."
npm run prisma:migrate:deploy
echo -e "${GREEN}✓ Database migrations đã được chạy${NC}"

echo ""
echo "Bước 8: Build project..."
npm run build
echo -e "${GREEN}✓ Project đã được build${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup hoàn tất!${NC}"
echo "=========================================="
echo ""
echo "Các bước tiếp theo:"
echo "1. Chỉnh sửa file .env và thêm DISCORD_TOKEN của bạn"
echo "2. Chạy bot với một trong các lệnh sau:"
echo "   - Development: npm run dev"
echo "   - Production:  npm start"
echo ""
echo "Để chạy bot như một service, xem hướng dẫn trong docs/UBUNTU_SETUP.md"
echo ""
