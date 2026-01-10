# Hướng dẫn Deploy LHT-Bot lên Server Ubuntu

Hướng dẫn chi tiết để deploy bot lên server Ubuntu từ xa qua SFTP/SSH.

## Thông tin Server

- **Server IP**: 157.245.53.128
- **User**: root
- **Đường dẫn**: `/opt/lth-bot`

## Phương pháp 1: Deploy qua Git (Khuyến nghị)

### Bước 1: Kết nối SSH vào Server

```bash
ssh root@157.245.53.128
```

### Bước 2: Cài đặt Node.js (nếu chưa có)

```bash
# Cập nhật package list
apt update

# Cài đặt curl
apt install -y curl

# Thêm NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Cài đặt Node.js
apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### Bước 3: Tạo thư mục và Clone Repository

```bash
# Tạo thư mục
mkdir -p /opt/lth-bot
cd /opt/lth-bot

# Clone repository (thay <repository-url> bằng URL thực tế)
git clone <repository-url> .

# Hoặc nếu đã có repository, pull code mới
git pull origin main
```

### Bước 4: Cài đặt Dependencies

```bash
cd /opt/lth-bot
npm install --production
```

### Bước 5: Cấu hình Environment Variables

```bash
# Tạo file .env
nano /opt/lth-bot/.env
```

Thêm nội dung:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DATABASE_URL="file:./data/database.sqlite"
```

Lưu file: `Ctrl + O`, `Enter`, `Ctrl + X`

### Bước 6: Thiết lập Database

```bash
cd /opt/lth-bot

# Tạo thư mục data
mkdir -p data

# Generate Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate:deploy
```

### Bước 7: Build Project

```bash
cd /opt/lth-bot
npm run build
```

### Bước 8: Tạo Systemd Service

```bash
nano /etc/systemd/system/lht-bot.service
```

Thêm nội dung sau:

```ini
[Unit]
Description=LHT Discord Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/lth-bot
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /opt/lth-bot/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Lưu file và kích hoạt service:

```bash
# Reload systemd
systemctl daemon-reload

# Enable service
systemctl enable lht-bot

# Start bot
systemctl start lht-bot

# Kiểm tra status
systemctl status lht-bot
```

## Phương pháp 2: Deploy qua SFTP (FileZilla, WinSCP, etc.)

### Bước 1: Upload Code lên Server

Sử dụng SFTP client (FileZilla, WinSCP, hoặc VS Code Remote):

**Thông tin kết nối:**
- **Protocol**: SFTP
- **Host**: 157.245.53.128
- **Port**: 22
- **User**: root
- **Password**: (password của bạn)
- **Remote directory**: `/opt/lth-bot`

**Upload các file/folder sau:**
- ✅ Toàn bộ thư mục `src/`
- ✅ Toàn bộ thư mục `prisma/`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `.gitignore`
- ❌ **KHÔNG upload**: `node_modules/`, `dist/`, `.env`, `data/`

### Bước 2: Kết nối SSH và Thiết lập

```bash
# SSH vào server
ssh root@157.245.53.128

# Di chuyển đến thư mục
cd /opt/lth-bot

# Cài đặt Node.js (nếu chưa có - xem Phương pháp 1, Bước 2)

# Cài đặt dependencies
npm install --production

# Tạo thư mục data
mkdir -p data

# Tạo file .env
nano .env
```

Thêm vào `.env`:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DATABASE_URL="file:./data/database.sqlite"
```

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate:deploy

# Build project
npm run build
```

### Bước 3: Tạo Systemd Service

Làm theo **Bước 8** trong Phương pháp 1 ở trên.

## Phương pháp 3: Deploy qua VS Code Remote-SSH

### Bước 1: Cài đặt Extension

1. Cài đặt extension **Remote - SSH** trong VS Code
2. Nhấn `F1` → gõ "Remote-SSH: Connect to Host"
3. Thêm host mới: `root@157.245.53.128`

### Bước 2: Kết nối và Upload

1. Kết nối đến server
2. Mở thư mục `/opt/lth-bot`
3. Upload code (có thể dùng Git hoặc copy trực tiếp)

### Bước 3: Mở Terminal trong VS Code

1. Mở terminal tích hợp (`Ctrl + ~`)
2. Chạy các lệnh setup như trong Phương pháp 1

## Quản lý Bot sau khi Deploy

### Xem Logs

```bash
# Xem logs real-time
journalctl -u lht-bot -f

# Xem logs gần đây (50 dòng)
journalctl -u lht-bot -n 50

# Xem logs từ một thời điểm cụ thể
journalctl -u lht-bot --since "2024-01-01 00:00:00"
```

### Quản lý Service

```bash
# Dừng bot
systemctl stop lht-bot

# Khởi động bot
systemctl start lht-bot

# Khởi động lại bot
systemctl restart lht-bot

# Kiểm tra trạng thái
systemctl status lht-bot

# Xem logs
journalctl -u lht-bot -f
```

### Cập nhật Bot

```bash
# SSH vào server
ssh root@157.245.53.128

# Dừng bot
systemctl stop lht-bot

# Di chuyển đến thư mục
cd /opt/lth-bot

# Nếu dùng Git
git pull origin main

# Hoặc upload code mới qua SFTP

# Cài đặt dependencies mới (nếu có)
npm install --production

# Chạy migrations mới (nếu có)
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate

# Build lại
npm run build

# Khởi động lại bot
systemctl start lht-bot

# Kiểm tra logs
journalctl -u lht-bot -f
```

## Backup Database

```bash
# Tạo backup
cp /opt/lth-bot/data/database.sqlite /opt/lth-bot/data/database_backup_$(date +%Y%m%d_%H%M%S).sqlite

# Hoặc backup vào thư mục khác
mkdir -p /root/backups
cp /opt/lth-bot/data/database.sqlite /root/backups/database_backup_$(date +%Y%m%d_%H%M%S).sqlite
```

## Kiểm tra Bot hoạt động

1. **Kiểm tra service status:**
   ```bash
   systemctl status lht-bot
   ```

2. **Kiểm tra logs:**
   ```bash
   journalctl -u lht-bot -n 20
   ```
   Bot sẽ hiển thị "Ready!" khi kết nối thành công

3. **Kiểm tra trong Discord:**
   - Bot phải online
   - Thử lệnh `/ping` để kiểm tra

4. **Kiểm tra process:**
   ```bash
   ps aux | grep node
   ```

## Troubleshooting

### Bot không khởi động

```bash
# Kiểm tra logs chi tiết
journalctl -u lht-bot -n 100 --no-pager

# Kiểm tra file .env
cat /opt/lth-bot/.env

# Kiểm tra Node.js
node --version

# Kiểm tra database
ls -la /opt/lth-bot/data/

# Kiểm tra build
ls -la /opt/lth-bot/dist/
```

### Lỗi Permission Denied

```bash
# Cấp quyền cho thư mục
chmod 755 /opt/lth-bot
chmod 755 /opt/lth-bot/data
chmod 644 /opt/lth-bot/data/database.sqlite
```

### Lỗi "Cannot find module"

```bash
cd /opt/lth-bot
rm -rf node_modules
npm install --production
npm run prisma:generate
npm run build
```

### Bot không phản hồi

1. Kiểm tra bot đã online trong Discord
2. Kiểm tra logs: `journalctl -u lht-bot -f`
3. Kiểm tra token trong `.env` có đúng không
4. Đợi vài phút (commands có thể mất thời gian để sync)

## Bảo mật

### 1. Tạo User riêng (Khuyến nghị)

Thay vì chạy với root, tạo user riêng:

```bash
# Tạo user mới
adduser lhtbot

# Cấp quyền cho thư mục
chown -R lhtbot:lhtbot /opt/lth-bot

# Cập nhật systemd service
nano /etc/systemd/system/lht-bot.service
```

Thay đổi:
```ini
User=lhtbot
```

### 2. Cấu hình Firewall

```bash
# Cài đặt UFW (nếu chưa có)
apt install ufw

# Cho phép SSH
ufw allow 22/tcp

# Bật firewall
ufw enable

# Kiểm tra status
ufw status
```

### 3. Bảo vệ file .env

```bash
# Chỉ owner mới đọc được
chmod 600 /opt/lth-bot/.env
```

### 4. Cập nhật hệ thống

```bash
# Cập nhật packages
apt update && apt upgrade -y
```

## Script Tự động Deploy

Tạo script để tự động hóa việc deploy:

```bash
nano /opt/lth-bot/deploy.sh
```

Thêm nội dung:

```bash
#!/bin/bash
set -e

echo "Deploying LHT-Bot..."

# Dừng bot
systemctl stop lht-bot

# Di chuyển đến thư mục
cd /opt/lth-bot

# Pull code mới (nếu dùng Git)
# git pull origin main

# Cài đặt dependencies
npm install --production

# Chạy migrations
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate

# Build
npm run build

# Khởi động lại bot
systemctl start lht-bot

echo "Deploy completed!"
journalctl -u lht-bot -n 10
```

Cấp quyền thực thi:

```bash
chmod +x /opt/lth-bot/deploy.sh
```

Sử dụng:

```bash
/opt/lth-bot/deploy.sh
```

## Monitoring

### Kiểm tra Resource Usage

```bash
# CPU và Memory
top -p $(pgrep -f "node.*dist/index.js")

# Disk usage
df -h
du -sh /opt/lth-bot

# Network
netstat -tulpn | grep node
```

### Tự động Restart nếu Crash

Service đã được cấu hình với `Restart=always`, bot sẽ tự động restart nếu crash.

## Liên kết Hữu ích

- [Hướng dẫn Ubuntu Setup](UBUNTU_SETUP.md) - Hướng dẫn chi tiết setup trên Ubuntu
- [Database Setup](DATABASE_SETUP.md) - Hướng dẫn quản lý database
- [README](../README.md) - Tài liệu chính của project
