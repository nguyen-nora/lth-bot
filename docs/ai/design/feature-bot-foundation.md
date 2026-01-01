---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

```mermaid
graph TD
    Discord[Discord API] -->|WebSocket + Intents| Bot[Discord Bot Client]
    Bot -->|Handles| Commands[Command Handler]
    Bot -->|Manages| Events[Event Handler]
    Bot -->|Registers| CmdReg[Command Registration]
    Bot -->|Uses| Intents[Gateway Intents<br/>Guilds]
    Commands -->|Uses| Database[(SQLite Database)]
    Events -->|Uses| Database
    Bot -->|Logs| Logger[Logging System]
    Bot -->|Config| Env[Environment Variables]
    Env -->|Validates| Config[Config Manager]
    
    Commands --> PingCmd[/ping Command]
    
    Database -->|better-sqlite3| DBFile[(data/database.sqlite)]
```

**Key components and their responsibilities:**
1. **Discord Bot Client**: Main bot instance, manages connection to Discord with Gateway intents
2. **Command Handler**: Processes slash commands, routes to appropriate command modules
3. **Event Handler**: Handles Discord events (ready, interactionCreate, etc.)
4. **Command Registration**: Registers slash commands with Discord (global or guild-specific)
5. **Database Manager**: Manages SQLite connection, provides query interface with prepared statements
6. **Logger**: Centralized logging for debugging and monitoring
7. **Config Manager**: Validates and manages environment variables
8. **Gateway Intents**: Configures bot permissions (minimum: Guilds)

**Technology stack choices and rationale:**
- **discord.js v14/v15**: Latest stable, excellent TypeScript support, modern interaction handling
- **better-sqlite3**: Fastest SQLite option, synchronous API perfect for single-threaded bot operations
- **TypeScript**: Type safety, better IDE support, catch errors at compile time
- **ESM modules**: Modern standard, better tree-shaking, future-proof
- **dotenv**: Environment variable management

## Data Models
**What data do we need to manage?**

**Initial Schema (Minimal for Foundation):**
- No complex data models required initially
- Database connection and basic table creation capability
- Future-ready structure for adding models

**Example Schema Structure (for testing):**
```sql
-- Simple test table to validate database operations
CREATE TABLE IF NOT EXISTS test (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Database Initialization Pattern:**
- Database file created at `data/database.sqlite` on first connection
- Tables created using `CREATE TABLE IF NOT EXISTS` pattern
- Prepared statements used for all queries (security + performance)
- Connection established on bot startup, closed on shutdown

**Data flow between components:**
1. Bot startup → Database connection established → Schema initialized (if needed)
2. Command execution → Database queries (if needed) → Prepared statements executed
3. Event handling → Database updates (if needed) → Transactions for multiple operations
4. Error scenarios → Logged to console/file → Graceful error handling

## API Design
**How do components communicate?**

**External APIs:**
- **Discord API**: Via discord.js library
  - Authentication: Bot token from environment variables
  - Interaction: Slash commands via interactionCreate event
  - Response: Interaction reply methods

**Internal interfaces:**
- **Command Interface**: 
  ```typescript
  interface Command {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
  }
  ```
- **Database Interface**:
  ```typescript
  import Database from 'better-sqlite3';
  
  class DatabaseManager {
    private db: Database.Database | null;
    
    // Connection management
    connect(): void;
    close(): void;
    isConnected(): boolean;
    
    // Query operations (using prepared statements)
    prepare(sql: string): Database.Statement;
    query(sql: string, params?: unknown[]): unknown[];
    
    // Transaction support
    transaction<T>(fn: () => T): T;
    
    // Utility methods
    exec(sql: string): void;
  }
  ```

**Request/response formats:**
- Discord interactions: JSON via Discord API
- Database queries: SQL with parameters
- Logging: Structured console output

**Authentication/authorization approach:**
- Bot token authentication via Discord OAuth2
- No user authentication required (Discord handles this)

## Component Breakdown
**What are the major building blocks?**

**Backend services/modules:**
1. **src/index.ts**: Main entry point, bot initialization with Gateway intents
2. **src/commands/ping.ts**: `/ping` command implementation
3. **src/events/ready.ts**: Bot ready event handler, command registration
4. **src/events/interactionCreate.ts**: Command interaction handler, routes to commands
5. **src/database/db.ts**: Database connection and management (singleton pattern)
6. **src/utils/logger.ts**: Logging utility (optional, can use console initially)
7. **src/config/env.ts**: Environment variable validation and loading

**Command Registration:**
- Commands registered on bot ready event
- Global registration (or guild-specific for testing)
- Registration errors handled gracefully
- Command data loaded from `src/commands/` directory

**Database/storage layer:**
- SQLite database file: `data/database.sqlite` (exact path, no alternatives)
- Database initialization on first run
- Connection singleton pattern (single instance shared across app)
- Directory created if it doesn't exist

**Third-party integrations:**
- **Discord.js**: Discord API communication
  - Gateway intents: `GatewayIntentBits.Guilds` (minimum)
  - Slash command support via `@discordjs/builders` or discord.js built-in
  - Automatic reconnection handling
- **better-sqlite3**: SQLite database operations
  - Synchronous API for single-threaded bot operations
  - Prepared statements for security and performance
  - Transaction support for atomic operations
- **dotenv**: Environment variable loading
  - Loads `.env` file on startup
  - Validates required variables via config manager

## Design Decisions
**Why did we choose this approach?**

**Key architectural decisions and trade-offs:**

1. **better-sqlite3 over ORM (initially)**
   - **Decision**: Use better-sqlite3 with raw SQL initially
   - **Rationale**: Simpler setup, maximum performance, no abstraction overhead
   - **Trade-off**: Can migrate to Drizzle/Prisma later if complexity grows
   - **Alternative considered**: Drizzle ORM (deferred for future)

2. **TypeScript over JavaScript**
   - **Decision**: Use TypeScript from the start
   - **Rationale**: Type safety, better IDE support, catch errors early
   - **Trade-off**: Slightly more setup, but worth it for maintainability

3. **ESM over CommonJS**
   - **Decision**: Use ES modules (import/export)
   - **Rationale**: Modern standard, better tree-shaking, future-proof
   - **Trade-off**: Requires package.json "type": "module" configuration

4. **File-based command structure**
   - **Decision**: Each command in separate file under `src/commands/`
   - **Rationale**: Scalable, easy to add new commands, clear organization
   - **Alternative considered**: Class-based commands (more complex, not needed yet)

5. **Event-driven architecture**
   - **Decision**: Separate event handlers in `src/events/`
   - **Rationale**: Clean separation, easy to add new events
   - **Pattern**: Event emitter pattern via discord.js

6. **Gateway Intents Configuration**
   - **Decision**: Use minimum required intents (`Guilds` for slash commands)
   - **Rationale**: Follows Discord best practices, only request what's needed
   - **Trade-off**: Must update intents if adding features requiring more permissions
   - **Future**: Can add `GuildMessages`, `MessageContent` if needed later

7. **Command Registration Strategy**
   - **Decision**: Global command registration (guild-specific for initial testing)
   - **Rationale**: Global commands work across all servers, simpler for production
   - **Trade-off**: Global commands take up to 1 hour to propagate (guild commands are instant)
   - **Testing**: Use guild-specific registration during development for faster iteration

**Patterns and principles applied:**
- **Separation of Concerns**: Commands, events, database, utils in separate modules
- **Single Responsibility**: Each module has one clear purpose
- **DRY (Don't Repeat Yourself)**: Reusable utilities and patterns
- **Configuration over Code**: Environment variables for settings
- **Fail Fast**: Validate configuration on startup

## Non-Functional Requirements
**How should the system perform?**

**Performance targets:**
- Bot startup: < 5 seconds
- Command response: < 100ms (excluding Discord API latency)
- Database queries: < 50ms for simple operations
- Memory usage: Minimal (SQLite is lightweight)

**Scalability considerations:**
- Code structure supports adding new commands easily
- Database schema can be extended without breaking changes
- Event handlers can be added incrementally
- Can migrate to more powerful database/ORM if needed

**Security requirements:**
- **Environment Variables:**
  - Bot token stored in `.env` file (never in code or version control)
  - `.env` file added to `.gitignore`
  - `.env.example` template provided (without actual token)
  - Environment variables validated on startup (fail fast if missing/invalid)
  - Config manager validates `DISCORD_TOKEN` format and presence

- **Database Security:**
  - Database file permissions: Read/write for bot process only
  - SQL injection prevention: All queries use prepared statements (better-sqlite3 enforces this)
  - Database file location: `data/database.sqlite` (not in public directories)
  - Connection errors handled securely (no sensitive info in error messages)

- **Input Validation:**
  - All user inputs validated in commands (future commands)
  - Command parameters validated before processing
  - Error messages are user-friendly but don't expose internal details
  - Rate limiting consideration for future expensive operations

- **Code Security:**
  - TypeScript strict mode enabled (catch type errors at compile time)
  - No hardcoded secrets or tokens
  - Dependencies kept up to date (security patches)

**Reliability/availability needs:**
- Graceful error handling (bot doesn't crash on errors)
- Connection retry logic for Discord API
- Database connection error handling
- Logging for debugging issues

