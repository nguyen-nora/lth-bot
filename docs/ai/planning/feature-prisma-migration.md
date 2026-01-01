---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [ ] **Milestone 1: Prisma Setup & Schema** - Prisma installed, schema defined, initial migration created
- [ ] **Milestone 2: Service Migration** - All services migrated to use Prisma Client
- [ ] **Milestone 3: Testing & Cleanup** - All tests pass, old code removed, documentation updated

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Prisma Setup & Schema Definition
- [ ] **Task 1.1**: Install Prisma dependencies
  - Add `prisma` and `@prisma/client` to package.json
  - Run `npm install`
  - Add Prisma scripts to package.json (generate, migrate, studio)
  
- [ ] **Task 1.2**: Create Prisma schema file
  - Create `prisma/schema.prisma` with SQLite datasource
  - Define all models (Marriage, Proposal, ProposalRateLimit, NotificationChannel)
  - Add indexes matching current database indexes
  - Configure field mappings (snake_case to camelCase)
  
- [ ] **Task 1.3**: Create Prisma Client singleton
  - Create `src/database/prisma.ts` with PrismaClient singleton
  - Export client instance for use by services
  - Handle PrismaClient initialization and connection
  
- [ ] **Task 1.4**: Generate initial migration
  - Run `npx prisma migrate dev --name init` to create initial migration
  - Verify migration SQL matches current schema
  - Test migration on fresh database

### Phase 2: Service Migration
- [ ] **Task 2.1**: Migrate MarriageService
  - Replace all `db.prepare()` and `db.query()` calls with Prisma Client
  - Update `createProposal()` method
  - Update `acceptProposal()` method
  - Update `declineProposal()` method
  - Update `getMarriage()` method
  - Update `getPendingProposal()` method
  - Update `getProposalById()` method
  - Update `divorce()` method
  - Update all other marriage-related queries
  - Test each method after migration
  
- [ ] **Task 2.2**: Migrate RateLimiterService
  - Replace `checkRateLimit()` SQL with Prisma query
  - Replace `updateRateLimit()` SQL with Prisma upsert
  - Replace `getTimeUntilNextProposal()` SQL with Prisma query
  - Test rate limiting functionality
  
- [ ] **Task 2.3**: Migrate ChannelManagerService
  - Replace `getNotificationChannel()` SQL with Prisma query
  - Replace `saveNotificationChannel()` SQL with Prisma upsert
  - Test channel management functionality
  
- [ ] **Task 2.4**: Migrate CleanupService
  - Replace `cleanupExpiredProposals()` SQL with Prisma deleteMany
  - Replace `markExpiredProposals()` SQL with Prisma updateMany
  - Test cleanup functionality

### Phase 3: Database Initialization & Integration
- [ ] **Task 3.1**: Update database initialization
  - Remove `initializeMarriageSchema()` function
  - Update `src/index.ts` to use Prisma migrations
  - Run Prisma migrations on startup (or use `prisma migrate deploy` in production)
  - Remove old `src/database/migrations/marriage.ts` file
  
- [ ] **Task 3.2**: Update main entry point
  - Replace `db.connect()` with Prisma Client initialization
  - Remove `db.isConnected()` checks (Prisma handles connection automatically)
  - Update error handling for Prisma errors
  - Test bot startup and initialization

### Phase 4: Cleanup & Documentation
- [ ] **Task 4.1**: Remove old database code
  - Delete `src/database/db.ts` (DatabaseManager class)
  - Delete `src/database/init.ts` (if no longer needed)
  - Remove `better-sqlite3` dependency from package.json
  - Remove `@types/better-sqlite3` from devDependencies
  
- [ ] **Task 4.2**: Update imports across codebase
  - Find and remove all imports of `./database/db.js`
  - Ensure all services import from Prisma Client
  - Update any command files that use database directly
  
- [ ] **Task 4.3**: Update documentation
  - Update architecture diagrams in design docs
  - Add Prisma setup instructions to README
  - Document migration process
  - Update any code examples in documentation

### Phase 5: Testing & Verification
- [ ] **Task 5.1**: Manual testing
  - Test marriage proposal flow (create, accept, decline)
  - Test rate limiting (verify 1 hour limit)
  - Test channel creation and retrieval
  - Test cleanup service (expired proposals)
  - Test divorce functionality
  - Verify all Discord commands work correctly
  
- [ ] **Task 5.2**: Data migration (if needed)
  - If existing database has data, verify it works with Prisma
  - Test migration on database with existing data
  - Verify no data loss during migration
  
- [ ] **Task 5.3**: Performance verification
  - Compare query performance (should be similar or better)
  - Check memory usage
  - Verify startup time is acceptable

## Dependencies
**What needs to happen in what order?**

**Task dependencies:**
- Phase 1 must complete before Phase 2 (services need Prisma Client)
- Phase 2 can be done in parallel for different services (but test after each)
- Phase 3 depends on Phase 2 completion (can't update initialization until services migrated)
- Phase 4 depends on Phase 3 (can't remove old code until new code works)
- Phase 5 should be done throughout, but final verification after Phase 4

**External dependencies:**
- Prisma package availability (npm)
- Node.js >=18.0.0 (already satisfied)
- SQLite (already in use)

**Team/resource dependencies:**
- Developer familiar with Prisma (or willing to learn)
- Access to test Discord server/guild
- Backup of existing database (if data exists)

## Timeline & Estimates
**When will things be done?**

**Estimated effort per phase:**
- **Phase 1: Prisma Setup & Schema** - 2-3 hours
  - Task 1.1: 30 minutes
  - Task 1.2: 1 hour
  - Task 1.3: 30 minutes
  - Task 1.4: 30 minutes
  
- **Phase 2: Service Migration** - 4-6 hours
  - Task 2.1: 2-3 hours (largest service)
  - Task 2.2: 30 minutes
  - Task 2.3: 30 minutes
  - Task 2.4: 30 minutes
  
- **Phase 3: Database Initialization** - 1 hour
  - Task 3.1: 30 minutes
  - Task 3.2: 30 minutes
  
- **Phase 4: Cleanup & Documentation** - 1-2 hours
  - Task 4.1: 30 minutes
  - Task 4.2: 30 minutes
  - Task 4.3: 30 minutes
  
- **Phase 5: Testing & Verification** - 2-3 hours
  - Task 5.1: 1-2 hours
  - Task 5.2: 30 minutes (if needed)
  - Task 5.3: 30 minutes

**Total estimated effort: 10-15 hours**

**Target dates for milestones:**
- Milestone 1: End of Phase 1
- Milestone 2: End of Phase 2
- Milestone 3: End of Phase 5

**Buffer for unknowns:**
- Add 20-30% buffer for unexpected issues
- Learning curve for Prisma (if unfamiliar)
- Debugging migration issues
- **Total with buffer: 12-20 hours**

## Risks & Mitigation
**What could go wrong?**

**Technical risks:**
1. **Risk**: Prisma doesn't support some SQLite features we use
   - **Mitigation**: Research Prisma SQLite limitations before starting, test early
   - **Impact**: Medium - may need workarounds or different approach
   
2. **Risk**: Performance degradation with Prisma
   - **Mitigation**: Benchmark early, optimize queries if needed
   - **Impact**: Low - Prisma is generally performant
   
3. **Risk**: Data loss during migration
   - **Mitigation**: Backup database before migration, test on copy first
   - **Impact**: High - but mitigated by backup
   
4. **Risk**: Breaking changes in service behavior
   - **Mitigation**: Thorough testing after each service migration
   - **Impact**: Medium - caught by testing

**Resource risks:**
1. **Risk**: Developer unfamiliar with Prisma
   - **Mitigation**: Prisma has excellent documentation, learning curve is manageable
   - **Impact**: Low - Prisma is well-documented

**Dependency risks:**
1. **Risk**: Prisma package issues or breaking changes
   - **Mitigation**: Use stable Prisma version, pin version in package.json
   - **Impact**: Low - Prisma is stable

**Mitigation strategies:**
- Create feature branch for migration
- Test each service migration independently
- Keep old code until new code is verified working
- Have rollback plan (git revert if needed)
- Test on development environment first

## Resources Needed
**What do we need to succeed?**

**Team members and roles:**
- Developer with TypeScript/Node.js experience
- Optional: Developer familiar with Prisma (nice to have, not required)

**Tools and services:**
- Node.js >=18.0.0
- npm or yarn package manager
- Prisma CLI (installed via npm)
- Discord bot test server/guild
- Git for version control

**Infrastructure:**
- Development environment
- Test Discord server
- Database backup capability

**Documentation/knowledge:**
- Prisma documentation: https://www.prisma.io/docs
- Prisma SQLite guide: https://www.prisma.io/docs/concepts/database-connectors/sqlite
- Current codebase documentation
- Existing database schema understanding

