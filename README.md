# LHT-Bot

A modern Discord bot built with TypeScript, discord.js v14, and SQLite database integration.

## Features

- ✅ Modern TypeScript codebase with ESM modules
- ✅ SQLite database integration using better-sqlite3
- ✅ Slash command support
- ✅ Scalable command and event handler system
- ✅ Environment variable configuration
- ✅ Graceful error handling and shutdown

## Prerequisites

- Node.js 18.x or 20.x LTS
- npm, yarn, or pnpm
- Discord bot token (from [Discord Developer Portal](https://discord.com/developers/applications))

## Setup

> **📖 Hướng dẫn chi tiết cho Ubuntu:** Xem [docs/UBUNTU_SETUP.md](docs/UBUNTU_SETUP.md) để có hướng dẫn đầy đủ về cách thiết lập và chạy bot trên Ubuntu, bao gồm cả việc chạy như một systemd service.
>
> **🚀 Quick Setup Script cho Ubuntu:** Chạy `bash scripts/ubuntu-setup.sh` để tự động hóa quá trình thiết lập.
>
> **☁️ Deploy lên Server từ xa:** Xem [docs/DEPLOY_TO_SERVER.md](docs/DEPLOY_TO_SERVER.md) để deploy bot lên server Ubuntu qua SSH/SFTP. Hoặc sử dụng script tự động: `bash scripts/deploy.sh`

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LHT-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` (if it exists, or create one)
   - Add your Discord bot token:
     ```
     DISCORD_TOKEN=your_bot_token_here
     ```

4. **Build the project** (optional, for production)
   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
LHT-Bot/
├── src/
│   ├── commands/          # Slash command implementations
│   │   ├── ping.ts
│   │   ├── kethon.ts     # Marriage proposal command
│   │   ├── lyhon.ts      # Divorce command
│   │   ├── status.ts     # User status command
│   │   ├── diemdanh.ts   # Attendance recording command
│   │   └── checkdd.ts    # Attendance checking command
│   ├── events/            # Discord event handlers
│   │   ├── ready.ts
│   │   └── interactionCreate.ts  # Handles commands and buttons
│   ├── services/          # Business logic services
│   │   ├── marriageService.ts      # Core marriage logic
│   │   ├── channelManager.ts      # Notification channel management
│   │   ├── rateLimiter.ts         # Proposal rate limiting
│   │   ├── cleanupService.ts      # Proposal cleanup
│   │   ├── statusService.ts       # User status aggregation
│   │   └── attendanceService.ts   # Attendance tracking
│   ├── database/          # Database connection and utilities
│   │   ├── db.ts
│   │   ├── init.ts
│   │   └── migrations/
│   │       └── marriage.ts        # Marriage system schema
│   ├── config/            # Configuration and environment
│   │   └── env.ts
│   ├── utils/             # Utility functions
│   │   ├── loadCommands.ts
│   │   └── loadEvents.ts
│   └── index.ts           # Main entry point
├── data/                  # Database files (gitignored)
│   └── database.sqlite
├── dist/                  # Compiled JavaScript (gitignored)
├── .env                   # Environment variables (gitignored)
├── .env.example           # Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

## Available Commands

### `/ping`
Replies with "Pong!" and displays bot latency.

### `/kethon @user`
Propose marriage to another user. Both users will receive private DMs:
- Proposer receives a confirmation message
- Proposed user receives a proposal with accept/decline buttons
- If accepted, marriage is announced in the notification channel
- If declined, both users receive an anonymous rejection message

**Rate Limit:** 1 proposal per hour per user

### `/lyhon`
Divorce your current partner. This is a silent operation (no announcements).
- Unilateral divorce (immediate)
- Both users receive confirmation DMs

### `/status [user]`
Check user status and marriage information. Shows:
- Marriage status (married/not married, partner, marriage date)
- Proposal statistics (sent/received, pending, accepted, declined)
- Attendance statistics (total days attended, last attendance date)
- Optional user parameter to check another user's status (defaults to yourself)
- Response is ephemeral (private, only visible to you)

### `/diemdanh`
Take attendance of all users currently in voice channels.
- Records all non-bot users present in any voice channel
- Stores attendance with timestamp and date (UTC)
- Returns confirmation with count of users recorded
- Response is public (visible to everyone)

**Note:** Bot requires `GUILD_VOICE_STATES` intent enabled in Discord Developer Portal.

### `/checkdd [date]`
Check attendance records for a specific date.
- Optional date parameter in YYYY-MM-DD format (defaults to today if not provided)
- Shows list of users who attended on the specified date
- Displays which voice channel each user was in
- Response is public (visible to everyone)

**Examples:**
- `/checkdd` - Shows today's attendance
- `/checkdd 2024-01-15` - Shows attendance for January 15, 2024

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | Yes |

## Development

### Scripts

- `npm run dev` - Start bot in development mode with hot reload (tsx watch)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (requires build first)
- `npm run type-check` - Type check without building

### Adding New Commands

1. Create a new file in `src/commands/` (e.g., `src/commands/mycommand.ts`)
2. Export a default object with `data` and `execute` properties:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello!');
  },
};
```

3. The command will be automatically loaded on bot startup

### Marriage System

The bot includes a marriage system with the following features:
- **Proposals**: Use `/kethon @user` to propose marriage
- **Private DMs**: Proposals are sent via private messages for privacy
- **Button Interactions**: Accept/decline proposals via Discord buttons
- **Announcements**: Successful marriages are announced in a dedicated channel
- **Rate Limiting**: Prevents spam (1 proposal per hour per user)
- **Divorce**: Use `/lyhon` to end a marriage (silent operation)

**Notification Channel:**
- Automatically created as "marriage-announcements" on first marriage
- Read-only for @everyone, bot can send messages
- Channel ID stored per guild in database

### Adding New Events

1. Create a new file in `src/events/` (e.g., `src/events/myevent.ts`)
2. Export a default object with `name`, `once` (optional), and `execute`:

```typescript
export default {
  name: 'myevent',
  once: false, // true if should only run once
  async execute(...args) {
    // Event handler logic
  },
};
```

3. The event will be automatically loaded on bot startup

## Database

The bot uses SQLite with better-sqlite3 for data persistence. The database file is located at `data/database.sqlite`.

### Database Operations

The database manager provides:
- Prepared statements for security and performance
- Transaction support
- Connection management (singleton pattern)

Example usage:
```typescript
import { db } from './database/db.js';

// Prepare a statement
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
const user = stmt.get(userId);

// Execute a query
const users = db.query('SELECT * FROM users', []);

// Use transactions
db.transaction(() => {
  // Multiple operations
});
```

## Troubleshooting

### Bot doesn't start
- Check that `.env` file exists and contains `DISCORD_TOKEN`
- Verify token is valid in Discord Developer Portal
- Check Node.js version: `node --version` (should be 18.x or 20.x)

### Commands not appearing in Discord
- Global commands can take up to 1 hour to propagate
- For faster testing, use guild-specific commands (see `src/events/ready.ts`)
- Check bot has proper permissions in your Discord server

### Database errors
- Ensure `data/` directory exists and is writable
- Check file permissions on `data/database.sqlite`

## Technology Stack

- **discord.js** v14 - Discord API library
- **Prisma** - Modern database ORM (SQLite)
- **TypeScript** - Type-safe JavaScript
- **ESM Modules** - Modern JavaScript modules
- **dotenv** - Environment variable management

## Bot Intents

The bot requires the following Discord intents:
- **Guilds** - Required for basic server functionality
- **GuildVoiceStates** - Required for voice channel attendance tracking (`/diemdanh`)

Enable these intents in your Discord Developer Portal under "Bot" → "Privileged Gateway Intents".

## License

ISC

## Contributing

1. Follow the existing code style
2. Add comments for complex logic
3. Test your changes before submitting
4. Update documentation as needed

