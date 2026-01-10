# Hướng dẫn Chạy LHT-Bot trên Ubuntu

Hướng dẫn chi tiết để thiết lập và chạy LHT-Bot trên hệ điều hành Ubuntu.

## Yêu cầu Hệ thống

- Ubuntu 20.04 LTS trở lên (hoặc bất kỳ bản phân phối Linux nào hỗ trợ Node.js)
- Node.js 18.x hoặc 20.x LTS
- npm (đi kèm với Node.js)
- Git (để clone repository)
- Discord Bot Token (từ [Discord Developer Portal](https://discord.com/developers/applications))

## Bước 1: Cài đặt Node.js

### Cách 1: Sử dụng NodeSource (Khuyến nghị)

```bash
# Cập nhật danh sách package
sudo apt update

# Cài đặt các công cụ cần thiết
sudo apt install -y curl

# Thêm NodeSource repository cho Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài đặt Node.js
sudo apt install -y nodejs

# Kiểm tra phiên bản
node --version
npm --version
```

### Cách 2: Sử dụng nvm (Node Version Manager)

```bash
# Cài đặt nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Tải lại shell configuration
source ~/.bashrc

# Cài đặt Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Kiểm tra phiên bản
node --version
npm --version
```

## Bước 2: Clone Repository

```bash
# Di chuyển đến thư mục bạn muốn đặt project
cd ~

# Clone repository (thay <repository-url> bằng URL thực tế)
git clone <repository-url> LHT-Bot

# Di chuyển vào thư mục project
cd LHT-Bot
```

## Bước 3: Cài đặt Dependencies

```bash
# Cài đặt tất cả các package cần thiết
npm install
```

Lệnh này sẽ tự động cài đặt:
- discord.js
- @prisma/client
- TypeScript
- và tất cả các dependencies khác

## Bước 4: Cấu hình Environment Variables

```bash
# Tạo file .env
nano .env
```

Thêm nội dung sau vào file `.env`:

```env
# Discord Bot Token (BẮT BUỘC)
DISCORD_TOKEN=your_discord_bot_token_here

# Database URL (tùy chọn, mặc định sẽ là ./data/database.sqlite)
DATABASE_URL="file:./data/database.sqlite"

# Guild ID (tùy chọn, dùng cho development - đăng ký command nhanh hơn)
# GUILD_ID=your_guild_id_here

# Super Admin ID (tùy chọn)
# SUPER_ADMIN=your_user_id_here

# Rate Limit (tùy chọn, mặc định là enabled)
# RATE_LIMIT=true
```

**Lưu ý quan trọng:**
- Thay `your_discord_bot_token_here` bằng Discord Bot Token thực tế của bạn
- Lấy token từ [Discord Developer Portal](https://discord.com/developers/applications)
- **KHÔNG BAO GIỜ** chia sẻ token này với ai hoặc commit vào Git

Lưu file: Nhấn `Ctrl + O`, sau đó `Enter`, rồi `Ctrl + X` để thoát.

## Bước 5: Thiết lập Database

```bash
# Tạo thư mục data nếu chưa có
mkdir -p data

# Tạo Prisma Client
npm run prisma:generate

# Chạy migrations để tạo database và tables
npm run prisma:migrate:deploy
```

Lệnh này sẽ:
- Tạo file database SQLite tại `data/database.sqlite`
- Tạo tất cả các bảng cần thiết (marriages, proposals, attendances, etc.)

## Bước 6: Build Project (Cho Production)

```bash
# Biên dịch TypeScript sang JavaScript
npm run build
```

Sau khi build, code JavaScript sẽ được tạo trong thư mục `dist/`.

## Bước 7: Chạy Bot

### Chế độ Development (với hot reload)

```bash
npm run dev
```

Bot sẽ tự động reload khi bạn thay đổi code.

### Chế độ Production

```bash
# Đảm bảo đã build trước
npm run build

# Chạy bot
npm start
```

## Bước 8: Chạy Bot như một Service (Systemd) - Khuyến nghị cho Production

Để bot tự động chạy khi server khởi động và tự động restart khi bị crash:

### Tạo Systemd Service File

```bash
sudo nano /etc/systemd/system/lht-bot.service
```

Thêm nội dung sau (điều chỉnh đường dẫn cho phù hợp):

```ini
[Unit]
Description=LHT Discord Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username/LHT-Bot
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /home/your_username/LHT-Bot/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Thay đổi:**
- `your_username`: Tên user của bạn trên Ubuntu (hoặc `root` nếu chạy với root)
- Đường dẫn `/home/your_username/LHT-Bot`: Đường dẫn thực tế đến project
  - Ví dụ: `/opt/lth-bot` nếu deploy vào `/opt/lth-bot`

### Kích hoạt và chạy Service

```bash
# Reload systemd để nhận service mới
sudo systemctl daemon-reload

# Bật service để tự động chạy khi boot
sudo systemctl enable lht-bot

# Khởi động bot
sudo systemctl start lht-bot

# Kiểm tra trạng thái
sudo systemctl status lht-bot

# Xem logs
sudo journalctl -u lht-bot -f
```

### Các lệnh quản lý Service

```bash
# Dừng bot
sudo systemctl stop lht-bot

# Khởi động lại bot
sudo systemctl restart lht-bot

# Xem logs
sudo journalctl -u lht-bot -n 50

# Xem logs real-time
sudo journalctl -u lht-bot -f
```

## Bước 9: Cấu hình Discord Bot

Đảm bảo bot của bạn có các quyền và intents cần thiết:

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Chọn ứng dụng bot của bạn
3. Vào mục **Bot** → **Privileged Gateway Intents**
4. Bật các intents sau:
   - ✅ **Guilds** (bắt buộc)
   - ✅ **Guild Voice States** (cần cho lệnh `/diemdanh`)

5. Vào mục **OAuth2** → **URL Generator**
6. Chọn các scopes:
   - `bot`
   - `applications.commands`
7. Chọn các bot permissions:
   - Send Messages
   - Read Message History
   - Connect (cho voice channel)
   - Speak (cho voice channel)
8. Copy URL và mở trong trình duyệt để mời bot vào server

## Kiểm tra Bot hoạt động

1. Bot sẽ hiển thị "Ready!" trong console khi kết nối thành công
2. Trong Discord, thử lệnh `/ping` để kiểm tra
3. Kiểm tra logs nếu có vấn đề:
   ```bash
   # Nếu chạy trực tiếp
   # Xem output trong terminal
   
   # Nếu chạy như service
   sudo journalctl -u lht-bot -n 100
   ```

## Troubleshooting

### Bot không khởi động

```bash
# Kiểm tra Node.js version
node --version  # Phải >= 18.0.0

# Kiểm tra file .env
cat .env  # Đảm bảo DISCORD_TOKEN được set

# Kiểm tra database
ls -la data/database.sqlite  # File phải tồn tại

# Kiểm tra build
ls -la dist/  # Thư mục dist phải có file index.js
```

### Lỗi Permission Denied

```bash
# Cấp quyền cho thư mục data
chmod 755 data
chmod 644 data/database.sqlite

# Hoặc nếu cần tạo database mới
chmod 755 data
```

### Lỗi Prisma

```bash
# Xóa Prisma Client cũ và generate lại
rm -rf node_modules/.prisma
npm run prisma:generate

# Hoặc reset database (CẢNH BÁO: Mất dữ liệu)
npm run prisma:migrate:reset
```

### Bot không phản hồi commands

1. Kiểm tra bot đã online trong Discord
2. Đợi vài phút (global commands có thể mất đến 1 giờ để sync)
3. Kiểm tra bot có quyền trong server
4. Thử dùng guild-specific commands (set `GUILD_ID` trong `.env`)

### Lỗi "Cannot find module"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Xem logs chi tiết

```bash
# Nếu chạy trực tiếp với npm run dev
# Logs sẽ hiển thị trong terminal

# Nếu chạy như service
sudo journalctl -u lht-bot -f --no-pager
```

## Cập nhật Bot

```bash
# Dừng bot
sudo systemctl stop lht-bot

# Pull code mới
git pull

# Cài đặt dependencies mới (nếu có)
npm install

# Chạy migrations mới (nếu có)
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate

# Build lại
npm run build

# Khởi động lại bot
sudo systemctl start lht-bot
```

## Backup Database

```bash
# Tạo backup
cp data/database.sqlite data/database_backup_$(date +%Y%m%d_%H%M%S).sqlite

# Hoặc backup vào thư mục khác
cp data/database.sqlite ~/backups/database_backup_$(date +%Y%m%d_%H%M%S).sqlite
```

## Bảo mật

1. **Không commit file `.env`** - Đã có trong `.gitignore`
2. **Giữ token bí mật** - Không chia sẻ với ai
3. **Sử dụng firewall** - Chỉ mở các port cần thiết
4. **Cập nhật hệ thống thường xuyên**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Sử dụng non-root user** - Chạy bot với user thường, không phải root

## Các lệnh hữu ích

```bash
# Xem thông tin Node.js
node --version
npm --version

# Xem process đang chạy
ps aux | grep node

# Xem port đang sử dụng (nếu có)
netstat -tulpn | grep node

# Xem disk usage
df -h

# Xem memory usage
free -h

# Xem CPU và memory của process
top -p $(pgrep -f "node.*dist/index.js")
```

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs của bot
2. File `.env` có đúng format không
3. Node.js version có đúng không
4. Database có được tạo thành công không
5. Bot có đúng permissions trong Discord không

## Deploy lên Server từ xa

Nếu bạn muốn deploy bot lên server Ubuntu từ xa (ví dụ: qua SFTP/SSH), xem hướng dẫn chi tiết tại:

📖 **[Hướng dẫn Deploy lên Server](DEPLOY_TO_SERVER.md)**

Hướng dẫn này bao gồm:
- Deploy qua Git
- Deploy qua SFTP
- Deploy qua VS Code Remote-SSH
- Tự động hóa với script deploy
- Quản lý và monitoring bot trên server

## Tài liệu tham khảo

- [Node.js Installation Guide](https://nodejs.org/en/download/package-manager/)
- [Discord.js Documentation](https://discord.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Systemd Service Guide](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
