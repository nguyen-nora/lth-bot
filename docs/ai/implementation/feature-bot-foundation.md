---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

**Prerequisites and dependencies:**
- Node.js LTS (18.x or 20.x recommended)
- npm, yarn, or pnpm package manager
- Discord bot application created at https://discord.com/developers/applications
- Bot token from Discord Developer Portal
- Discord server for testing (with bot invited)

**Environment setup steps:**
1. Clone/initialize project repository
2. Run `npm install` (or equivalent) to install dependencies
3. Copy `.env.example` to `.env`
4. Add Discord bot token to `.env` file
5. Run `npm run dev` or `npm start` to start bot

**Configuration needed:**
- `.env` file with `DISCORD_TOKEN=your_bot_token_here`
- `package.json` with `"type": "module"` for ESM support
- `tsconfig.json` for TypeScript configuration
- Bot permissions in Discord server (Send Messages, Use Slash Commands)

## Code Structure
**How is the code organized?**

**Directory structure:**
```
LHT-Bot/
├── src/
│   ├── commands/
│   │   └── ping.ts              # Slash commands
│   ├── events/
│   │   ├── ready.ts             # Bot ready event
│   │   └── interactionCreate.ts # Command interaction handler
│   ├── database/
│   │   └── db.ts                # Database connection and utilities
│   ├── utils/
│   │   └── logger.ts            # Logging utility (optional)
│   ├── config/
│   │   └── env.ts               # Environment variable validation
│   └── index.ts                 # Main entry point
├── data/
│   └── database.sqlite          # SQLite database file (gitignored)
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

**Module organization:**
- **Commands**: One file per command, export default object with `data` and `execute`
- **Events**: One file per event, export default function
- **Database**: Singleton pattern for database connection
- **Utils**: Reusable helper functions
- **Config**: Configuration and validation

**Naming conventions:**
- Files: `kebab-case.ts` (e.g., `interaction-create.ts` or `interactionCreate.ts`)
- Classes: `PascalCase` (e.g., `Database`, `Logger`)
- Functions/variables: `camelCase` (e.g., `executeCommand`, `botClient`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DISCORD_TOKEN`)

## Implementation Notes
**Key technical details to remember:**

### Core Features

**Feature 1: Bot Initialization**
- Use `Client` from discord.js with necessary intents
- Gateway intents needed: `Guilds`, `GuildMessages` (if needed later)
- Set up error handlers for client errors
- Implement graceful shutdown (SIGINT, SIGTERM)

**Feature 2: Command Handler**
- Dynamically load commands from `src/commands/` directory
- Register commands with Discord on bot ready
- Route interactions to appropriate command based on `commandName`
- Handle command errors gracefully

**Feature 3: Database Connection**
- Use better-sqlite3 `Database` class
- Initialize connection in singleton pattern
- Create database file if it doesn't exist
- Use prepared statements for all queries (security + performance)
- Handle connection errors gracefully

**Feature 4: Ping Command**
- Use `SlashCommandBuilder` from `@discordjs/builders` or discord.js
- Calculate latency: `Date.now() - interaction.createdTimestamp`
- Reply with latency information or simple "Pong!"
- Handle interaction timeout (15 seconds for initial response)

### Patterns & Best Practices

**Design patterns being used:**
- **Singleton**: Database connection (single instance)
- **Module Pattern**: Command and event exports
- **Event-Driven**: Discord event handling
- **Factory Pattern**: Command loading from files

**Code style guidelines:**
- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use async/await for asynchronous operations
- Add JSDoc comments for public functions
- Keep functions small and focused (single responsibility)

**Common utilities/helpers:**
- Environment variable getter with validation
- Error formatter for consistent error messages
- Logger wrapper (if custom logging needed)
- Database query helper (if needed)

## Integration Points
**How do pieces connect?**

**API integration details:**
- **Discord API**: Via discord.js Client
  - Authentication: `client.login(process.env.DISCORD_TOKEN)`
  - Event listening: `client.on('eventName', handler)`
  - Interaction handling: `interactionCreate` event

**Database connections:**
- Single SQLite connection via better-sqlite3
- Connection established on bot startup
- Connection closed on bot shutdown
- No connection pooling needed (SQLite is single-connection)

**Third-party service setup:**
- Discord Developer Portal: Create application, get bot token
- No other external services required initially

## Error Handling
**How do we handle failures?**

**Error handling strategy:**
- **Bot startup errors**: Catch and log, exit gracefully
- **Command errors**: Try-catch in command handler, reply with error message
- **Database errors**: Catch and log, don't crash bot
- **Discord API errors**: Handle rate limits, network errors gracefully

**Logging approach:**
- Use `console.log`, `console.error` initially (can upgrade to winston/pino later)
- Log levels: INFO, ERROR, WARN
- Include timestamps and context in logs
- Log to console (can add file logging later)

**Retry/fallback mechanisms:**
- Discord reconnection: Automatic via discord.js
- Database operations: No retry needed (local file)
- Command execution: Return error message to user

## Performance Considerations
**How do we keep it fast?**

**Optimization strategies:**
- Use prepared statements for database queries (better-sqlite3 does this)
- Lazy load commands (load on startup, not on each interaction)
- Cache command list in memory
- Minimize database queries (batch if possible)

**Caching approach:**
- Command registry cached in memory
- No external caching needed initially

**Query optimization:**
- Use indexes when creating tables (future)
- Use transactions for multiple operations (future)
- Keep queries simple and focused

**Resource management:**
- Close database connection on shutdown
- Clean up event listeners on shutdown
- Dispose of Discord client properly

## Security Notes
**What security measures are in place?**

**Authentication/authorization:**
- Bot token authentication via Discord OAuth2
- Token stored in environment variables (never in code)
- Token validation on startup

**Input validation:**
- Discord.js handles basic validation
- Additional validation for command parameters (future commands)
- SQL injection prevention via prepared statements (better-sqlite3)

**Data encryption:**
- Database file not encrypted (local development)
- Can add encryption for production if needed

**Secrets management:**
- `.env` file for local development
- `.env` in `.gitignore` (never commit)
- `.env.example` as template (no secrets)

