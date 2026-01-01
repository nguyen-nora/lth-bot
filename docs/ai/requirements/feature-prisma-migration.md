---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- **Current situation**: The bot uses `better-sqlite3` with a custom `DatabaseManager` singleton and raw SQL queries throughout the codebase. Schema initialization is done via manual SQL in `initializeMarriageSchema()` function that runs on bot startup. This approach has several limitations:
  - Manual SQL query writing is error-prone and lacks type safety
  - No automatic schema migrations or versioning
  - Difficult to maintain and refactor database schema
  - No built-in query builder or ORM features
  - Manual prepared statement management
  - No database introspection or schema validation
- **Who is affected**: Developers maintaining and extending the bot, especially when adding new features or modifying database schema
- **Pain points**:
  - Schema changes require manual SQL migration scripts
  - Type safety is manual (interfaces must match SQL results)
  - No automatic relationship handling
  - Difficult to test with database mocking
  - No database seeding utilities

## Goals & Objectives
**What do we want to achieve?**

- **Primary goals**:
  - Migrate from `better-sqlite3` to Prisma ORM with SQLite
  - Maintain all existing functionality (marriage system, rate limiting, channel management, cleanup)
  - Improve type safety with Prisma's generated types
  - Enable automatic schema migrations
  - Preserve existing data (if any exists)
  - Maintain or improve performance
- **Secondary goals**:
  - Simplify database access patterns
  - Enable easier testing with Prisma's testing utilities
  - Improve developer experience with Prisma Studio
  - Better error handling and validation
- **Non-goals** (what's explicitly out of scope):
  - Changing database from SQLite to another database
  - Adding new features (this is a refactoring/migration only)
  - Changing the external API/interface of services
  - Performance optimizations beyond maintaining current performance

## User Stories & Use Cases
**How will users interact with the solution?**

- **As a developer**, I want to use Prisma Client so that I have type-safe database queries
- **As a developer**, I want Prisma migrations so that schema changes are versioned and trackable
- **As a developer**, I want Prisma Studio so that I can visually inspect and edit database data
- **As a developer**, I want the same functionality to work after migration so that no features break
- **As a developer**, I want existing data preserved so that no data is lost during migration
- **As a developer**, I want a safe migration process so that I can roll back if something goes wrong

**Key workflows and scenarios**:
- All existing marriage system operations (propose, accept, decline, divorce)
- Rate limiting checks and updates
- Channel management (get/create notification channels)
- Cleanup service (mark expired, delete old proposals)
- Database initialization and schema setup

**Edge cases to consider**:
- Empty database (fresh install)
- Database with existing data (migration path)
- Concurrent access patterns
- Error handling during migration
- Rollback strategy if migration fails

## Success Criteria
**How will we know when we're done?**

- **Measurable outcomes**:
  - All existing tests pass (if any exist)
  - All services work identically to before migration
  - No data loss during migration
  - Type safety: All database queries use Prisma Client with generated types
  - Zero raw SQL queries in service code (except where Prisma doesn't support specific SQLite features)
  - Migration can be safely executed and rolled back if needed
- **Acceptance criteria**:
  - ✅ Prisma schema defined for all tables (marriages, proposals, proposal_rate_limits, notification_channels)
  - ✅ All services migrated to use Prisma Client
  - ✅ Database initialization uses Prisma migrations
  - ✅ All existing functionality works (marriage commands, rate limiting, cleanup)
  - ✅ No breaking changes to service interfaces
  - ✅ Existing data (if any) is preserved
  - ✅ Documentation updated
- **Performance benchmarks**:
  - Database operations maintain similar or better performance
  - No significant startup time increase
  - Query execution time remains acceptable for Discord bot use case

## Constraints & Assumptions
**What limitations do we need to work within?**

- **Technical constraints**:
  - Must remain on SQLite (not changing database engine)
  - Must maintain Node.js compatibility (current: >=18.0.0)
  - Must work with ESM modules (project uses `"type": "module"`)
  - Must maintain TypeScript support
  - Must preserve existing service interfaces (no breaking API changes)
- **Business constraints**:
  - No service interruption during migration (bot should continue working after migration is complete)
  - No data loss during migration
  - Migration should be reversible (rollback capability)
- **Time/budget constraints**:
  - Migration should be completed in a reasonable timeframe
  - Should not require extensive testing infrastructure changes
- **Assumptions we're making**:
  - Existing database schema is well-understood and documented
  - Prisma supports all SQLite features we're using
  - Team is familiar with or can learn Prisma quickly
  - Existing data volume is manageable for migration

## Questions & Open Items
**What do we still need to clarify?**

- **Unresolved questions**:
  - Should we use Prisma Migrate (`prisma migrate dev`) or baseline migrations (`prisma migrate resolve`)? 
    - **Recommendation**: Use `prisma migrate dev` for initial migration, then `prisma migrate deploy` for production
  - How to handle the existing `data/database.sqlite` file (if it exists)?
    - **Recommendation**: If database exists with data, use Prisma's `db push` or create baseline migration. If empty, use fresh migration.
  - Should we keep the singleton pattern or use Prisma's recommended patterns?
    - **Recommendation**: Keep singleton for consistency with existing codebase, but follow Prisma's connection pooling best practices
  - Do we need to support database rollback scenarios?
    - **Recommendation**: Yes, use Git for code rollback and Prisma migration rollback commands if needed
- **Items requiring stakeholder input**:
  - Confirmation that no production data exists (or data migration plan if it does)
  - Approval for dependency changes (adding Prisma, removing better-sqlite3)
- **Research needed**:
  - Prisma SQLite-specific features and limitations (verify all current SQL features are supported)
  - Performance comparison between better-sqlite3 and Prisma (benchmark key queries if performance is critical)
  - Best practices for Prisma in Discord bot context (connection management, error handling)
  - Prisma migration strategies for existing databases (baseline vs fresh migration)
  - Prisma Client generation with ESM modules (`"type": "module"` compatibility)

