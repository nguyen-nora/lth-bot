---
phase: requirements
title: Discord Bot Technology Stack Research
description: Latest technologies and best practices for SQLite + discord.js integration
---

# Discord Bot Technology Stack Research

## Overview
This document outlines the latest technologies and modern approaches for building a Discord bot with SQLite database integration and slash command support.

## Core Technologies

### Discord.js Version
**Recommended: discord.js v14 or v15 (latest stable)**

- **v14** (Current stable): Full TypeScript support, modern interaction handling
- **v15** (Latest): Enhanced features, improved performance
- **Key Features:**
  - Built-in slash command support
  - Interaction handlers (buttons, modals, select menus)
  - Improved TypeScript definitions
  - Better error handling

### SQLite Database Options

#### 1. **better-sqlite3** ⭐ (Recommended for Performance)
**Best for: Synchronous operations, high performance**

- **Pros:**
  - Fastest SQLite library for Node.js (synchronous API)
  - No async/await overhead
  - Simple, direct SQL queries
  - Great for Discord bots (single-threaded operations)
  - Excellent TypeScript support

- **Cons:**
  - Synchronous (blocks event loop, but fine for Discord bots)
  - Manual SQL queries (no ORM)

- **Use Case:** When you want maximum performance and don't need complex relationships

#### 2. **Drizzle ORM** ⭐ (Recommended for TypeScript)
**Best for: Type-safe, modern ORM with excellent TypeScript support**

- **Pros:**
  - Lightweight and performant
  - Excellent TypeScript inference
  - SQL-like syntax (not abstracted away)
  - Great developer experience
  - Supports migrations
  - Growing ecosystem (2024+ trend)

- **Cons:**
  - Newer library (less community resources)
  - Requires learning Drizzle syntax

- **Use Case:** TypeScript projects wanting type safety with SQL-like queries

#### 3. **Prisma** (Enterprise-Grade)
**Best for: Complex schemas, migrations, team collaboration**

- **Pros:**
  - Excellent TypeScript support
  - Powerful migration system
  - Great developer tools (Prisma Studio)
  - Strong documentation
  - Auto-generated types

- **Cons:**
  - Heavier than Drizzle
  - More abstraction from SQL
  - Can be overkill for simple bots

- **Use Case:** Complex bots with many models and relationships

#### 4. **Kysely** (Type-Safe Query Builder)
**Best for: Type-safe SQL without ORM overhead**

- **Pros:**
  - Pure TypeScript, compile-time type safety
  - SQL-like syntax
  - Lightweight
  - Great for complex queries

- **Cons:**
  - More manual work than ORMs
  - Less popular than Prisma/Drizzle

- **Use Case:** When you want type safety but prefer SQL over ORM abstractions

#### 5. **Sequelize** (Traditional ORM)
**Best for: Familiar ORM patterns, extensive documentation**

- **Pros:**
  - Mature, well-documented
  - Many tutorials available
  - Supports multiple databases
  - Associations/relationships

- **Cons:**
  - Heavier than modern alternatives
  - Less TypeScript-friendly
  - Older patterns

- **Use Case:** If you're already familiar with Sequelize

#### 6. **Keyv** (Simple Key-Value Store)
**Best for: Simple caching, minimal data storage**

- **Pros:**
  - Extremely simple
  - Multiple backends (SQLite, Redis, etc.)
  - Good for caching

- **Cons:**
  - Not suitable for complex data
  - No relationships
  - Limited querying

- **Use Case:** Simple bots with minimal data needs

## Modern Architecture Patterns

### 1. **Command Handler Structure**
```
src/
├── commands/
│   ├── ping.js (or .ts)
│   └── ...
├── events/
│   ├── ready.js
│   └── interactionCreate.js
├── database/
│   ├── db.js (database connection)
│   ├── models/ (if using ORM)
│   └── migrations/ (if using ORM with migrations)
└── utils/
    └── ...
```

### 2. **TypeScript vs JavaScript**
- **TypeScript Recommended:** Better IDE support, type safety, fewer runtime errors
- **Modern Setup:** Use ES modules (ESM) with TypeScript
- **Config:** `tsconfig.json` with modern settings

### 3. **Module System**
- **ESM (ES Modules):** Modern standard, better tree-shaking
- **CommonJS:** Traditional, still widely used
- **Recommendation:** Use ESM for new projects

## Recommended Stack Combinations

### Option 1: **Modern & Type-Safe** ⭐ (Recommended)
```
- discord.js v14/v15
- TypeScript
- Drizzle ORM + better-sqlite3
- ESM modules
- Modern command handler
```

**Why:** Best balance of performance, type safety, and modern practices

### Option 2: **Maximum Performance**
```
- discord.js v14/v15
- JavaScript or TypeScript
- better-sqlite3 (raw SQL)
- ESM modules
```

**Why:** Fastest database operations, minimal overhead

### Option 3: **Enterprise-Ready**
```
- discord.js v14/v15
- TypeScript
- Prisma + SQLite
- ESM modules
- Full migration system
```

**Why:** Best for complex bots with many features and team collaboration

### Option 4: **Simple & Quick**
```
- discord.js v14/v15
- JavaScript
- better-sqlite3 (raw SQL)
- CommonJS
```

**Why:** Fastest to set up, minimal dependencies

## Implementation Ideas

### Database Setup Patterns

#### Pattern 1: Database Manager Class
```typescript
// database/db.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

class DatabaseManager {
  private db: Database.Database;
  // Initialize, migrations, etc.
}
```

#### Pattern 2: Connection Singleton
```typescript
// database/connection.ts
// Single connection instance shared across app
```

#### Pattern 3: Repository Pattern
```typescript
// database/repositories/
// Separate files for each entity (UserRepository, etc.)
```

### Command Handler Patterns

#### Pattern 1: File-Based Commands
```typescript
// commands/ping.ts
export default {
  data: new SlashCommandBuilder()...,
  execute: async (interaction) => {...}
}
```

#### Pattern 2: Class-Based Commands
```typescript
// commands/PingCommand.ts
export class PingCommand extends BaseCommand {
  // ...
}
```

#### Pattern 3: Decorator Pattern (Advanced)
```typescript
// Using libraries like @sapphire/framework
```

## Best Practices (2024-2025)

1. **Use Slash Commands:** Discord's preferred interaction method
2. **TypeScript:** Strongly recommended for maintainability
3. **Error Handling:** Comprehensive try-catch with logging
4. **Environment Variables:** Use `.env` files (dotenv package)
5. **Logging:** Use structured logging (winston, pino)
6. **Database Migrations:** Always use migrations for schema changes
7. **Connection Pooling:** Not needed for SQLite (single connection)
8. **Prepared Statements:** Always use for queries (security + performance)
9. **Type Safety:** Leverage TypeScript for database models
10. **Code Organization:** Separate commands, events, database logic

## Security Considerations

1. **SQL Injection:** Use prepared statements (all modern libraries do this)
2. **Environment Variables:** Never commit tokens/keys
3. **Input Validation:** Validate all user inputs
4. **Rate Limiting:** Implement for expensive operations
5. **Permissions:** Check bot permissions before operations

## Performance Tips

1. **Database Indexes:** Add indexes for frequently queried columns
2. **Connection Reuse:** Single SQLite connection (better-sqlite3)
3. **Batch Operations:** Use transactions for multiple operations
4. **Lazy Loading:** Load data only when needed
5. **Caching:** Cache frequently accessed data (Redis/Keyv for complex bots)

## Next Steps

1. **Choose your stack** based on complexity needs
2. **Set up project structure** following modern patterns
3. **Initialize database** with chosen library
4. **Create `/ping` command** as proof of concept
5. **Test database connection** with simple read/write
6. **Expand** with additional features

## Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Prisma Docs](https://www.prisma.io/docs)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Discord.js Discord Server](https://discord.gg/djs)

