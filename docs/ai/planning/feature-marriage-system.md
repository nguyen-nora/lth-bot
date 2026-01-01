---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [ ] **Milestone 1: Database Schema** - Marriage and proposal tables created
- [ ] **Milestone 2: Proposal System** - `/kethon` command and DM system working
- [ ] **Milestone 3: Button Interactions** - Accept/decline buttons functional
- [ ] **Milestone 4: Marriage Announcements** - Channel creation and announcements working
- [ ] **Milestone 5: Divorce System** - `/lyhon` command implemented
- [ ] **Milestone 6: Complete** - All features tested and working

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Database Schema & Services
- [ ] **Task 1.1**: Create database schema for marriages
  - Create `marriages` table
  - Create `proposals` table (without proposer_accepted field)
  - Create `proposal_rate_limits` table
  - Create `notification_channels` table
  - Add indexes for performance
  - **Estimate**: 25 minutes

- [ ] **Task 1.2**: Create marriage service
  - Implement `MarriageService` class
  - Methods: `createProposal`, `checkRateLimit`, `handleProposalResponse`, `checkButtonExpiration`, `getMarriage`, `createMarriage`, `divorce`, `cleanupExpiredProposals`
  - Database operations with prepared statements
  - **Estimate**: 50 minutes

- [ ] **Task 1.3**: Create channel manager service
  - Implement `ChannelManager` class
  - Methods: `getOrCreateNotificationChannel` (default name: "marriage-announcements"), `getNotificationChannel`
  - Handle channel creation with permissions
  - **Estimate**: 30 minutes

- [ ] **Task 1.4**: Create rate limiter service
  - Implement `RateLimiter` class
  - Methods: `checkRateLimit`, `updateRateLimit`
  - Track last proposal time per user per guild
  - **Estimate**: 20 minutes

- [ ] **Task 1.5**: Create cleanup service
  - Implement `CleanupService` class
  - Method: `cleanupExpiredProposals` (removes declined/expired proposals after 7 days)
  - Schedule cleanup on bot startup
  - **Estimate**: 25 minutes

### Phase 2: Kethon Command Implementation
- [ ] **Task 2.1**: Create `/kethon` command
  - Slash command with user option
  - Input validation (self-marriage, bot-marriage, already married, etc.)
  - Rate limit check (1 per hour per user)
  - Create proposal record
  - **Estimate**: 35 minutes

- [ ] **Task 2.2**: Implement DM sending for proposals
  - Send confirmation DM to proposer (no buttons): "You have proposed to @User. Waiting for their response..."
  - Send proposal DM to proposed user with accept/decline buttons
  - Handle DM failures gracefully (send error in command channel)
  - **Estimate**: 40 minutes

- [ ] **Task 2.3**: Create button components
  - Accept button (green, custom ID: `proposal_accept_{proposalId}`)
  - Decline button (red, custom ID: `proposal_decline_{proposalId}`)
  - Embed message with proposal details
  - Note: Buttons expire after 15 minutes (Discord limitation)
  - **Estimate**: 25 minutes

### Phase 3: Button Interaction Handling
- [ ] **Task 3.1**: Extend interaction handler for buttons
  - Detect button interactions
  - Parse custom IDs to identify proposal
  - Route to proposal response handler
  - **Estimate**: 30 minutes

- [ ] **Task 3.2**: Implement proposal response logic
  - Check button expiration before processing
  - Update proposal state in database (only proposed_accepted field)
  - Handle decline (send anonymous rejection to both users)
  - Handle acceptance (create marriage, announce in notification channel)
  - **Estimate**: 45 minutes

### Phase 4: Marriage Announcements
- [ ] **Task 4.1**: Implement channel creation logic
  - Check if notification channel exists
  - Create channel if doesn't exist
  - Set appropriate permissions
  - Save channel ID to database
  - **Estimate**: 35 minutes

- [ ] **Task 4.2**: Create marriage announcement
  - Format announcement message
  - Send announcement to notification channel
  - Handle channel not found errors
  - **Estimate**: 20 minutes

### Phase 5: Divorce Command
- [ ] **Task 5.1**: Create `/lyhon` command
  - Slash command implementation
  - Check if user is married
  - Handle unilateral divorce (immediate)
  - Handle mutual consent (optional - send DM to partner for confirmation)
  - **Estimate**: 40 minutes

- [ ] **Task 5.2**: Implement divorce logic
  - Remove marriage from database
  - Send confirmation DM to both users (no announcement)
  - Handle edge cases (not married, wrong partner)
  - **Estimate**: 25 minutes

### Phase 6: Error Handling & Edge Cases
- [ ] **Task 6.1**: Handle DM failures
  - User has DMs disabled
  - User blocked bot
  - Fallback error messages
  - **Estimate**: 20 minutes

- [ ] **Task 6.2**: Handle permission errors
  - Bot can't create channels
  - Bot can't send messages
  - Bot can't send DMs
  - Clear error messages to users
  - **Estimate**: 25 minutes

- [ ] **Task 6.3**: Handle edge cases
  - User leaves server during proposal
  - Channel deleted by admin (recreate on next announcement)
  - Duplicate proposals (prevent with database constraints)
  - Button expiration (15-minute limit, handle gracefully)
  - Rate limit exceeded
  - **Estimate**: 30 minutes

### Phase 7: Testing & Polish
- [ ] **Task 7.1**: Test all workflows
  - Successful marriage proposal and acceptance
  - Proposal decline scenarios
  - Divorce scenarios
  - Error scenarios
  - **Estimate**: 45 minutes

- [ ] **Task 7.2**: Code cleanup and documentation
  - Add code comments
  - Update README with new commands
  - Ensure consistent code style
  - **Estimate**: 20 minutes

## Dependencies
**What needs to happen in what order?**

**Task dependencies and blockers:**
1. Phase 1 (Database & Services) must complete before Phase 2
2. Phase 2 (Kethon Command) must complete before Phase 3
3. Phase 3 (Button Interactions) must complete before Phase 4
4. Phase 4 (Announcements) can be done in parallel with Phase 5
5. Phase 5 (Divorce) depends on Phase 1
6. Phase 6 (Error Handling) should be done throughout, but finalize after core features
7. Phase 7 (Testing) depends on all previous phases

**External dependencies:**
- Discord bot token and permissions
- Bot must have: Send Messages, Send DMs, Create Channels, Manage Channels permissions
- Users must be in a Discord server

**Team/resource dependencies:**
- Single developer (no team coordination needed)

## Timeline & Estimates
**When will things be done?**

**Estimated effort per task/phase:**
- Phase 1: ~95 minutes (~1.5 hours)
- Phase 2: ~95 minutes (~1.5 hours)
- Phase 3: ~75 minutes (~1.25 hours)
- Phase 4: ~55 minutes (~1 hour)
- Phase 5: ~65 minutes (~1 hour)
- Phase 6: ~75 minutes (~1.25 hours)
- Phase 7: ~65 minutes (~1 hour)
- **Total**: ~6.5 hours (including testing and debugging buffer)

**Target dates for milestones:**
- Milestone 1: Day 1 (Database Schema)
- Milestone 2: Day 1 (Proposal System)
- Milestone 3: Day 1 (Button Interactions)
- Milestone 4: Day 1 (Announcements)
- Milestone 5: Day 1 (Divorce System)
- Milestone 6: Day 1 (Complete)

**Buffer for unknowns:**
- Add 1-2 hours buffer for:
  - Discord API rate limits during testing
  - Button interaction debugging
  - DM delivery issues
  - Channel permission problems
  - Database transaction issues

## Risks & Mitigation
**What could go wrong?**

**Technical risks:**
1. **Risk**: Discord button interactions expire after 15 minutes
   - **Mitigation**: Accept limitation, proposals may expire (document behavior)
   - **Impact**: Low (users can re-propose)

2. **Risk**: Users have DMs disabled
   - **Mitigation**: Handle gracefully, send error message in channel
   - **Impact**: Medium (feature unusable for those users)

3. **Risk**: Bot lacks permissions to create channels
   - **Mitigation**: Check permissions, send clear error message
   - **Impact**: Medium (announcements won't work, but can use existing channel)

4. **Risk**: Race conditions with simultaneous proposals
   - **Mitigation**: Database constraints, transaction locks
   - **Impact**: Low (database handles this)

5. **Risk**: Proposal state lost if bot restarts
   - **Mitigation**: Store all state in database, recover on startup
   - **Impact**: Low (proposals persist)

**Resource risks:**
- None identified (single developer, local development)

**Dependency risks:**
1. **Risk**: Discord API rate limits
   - **Mitigation**: Implement rate limit handling, batch operations
   - **Impact**: Low (Discord.js handles most rate limiting)

2. **Risk**: Database corruption or file lock
   - **Mitigation**: Use transactions, handle errors gracefully
   - **Impact**: Low (SQLite is reliable)

## Resources Needed
**What do we need to succeed?**

**Team members and roles:**
- Developer: Full-stack bot development

**Tools and services:**
- Node.js (LTS version 18.x or 20.x)
- npm/yarn/pnpm package manager
- Code editor with TypeScript support
- Discord Developer Portal access
- Discord server for testing (with multiple test users)

**Infrastructure:**
- Local development machine
- Internet connection (for Discord API)
- Existing bot infrastructure (from bot-foundation feature)

**Documentation/knowledge:**
- Discord.js documentation: https://discordjs.guide/
- Discord.js button interactions guide
- Discord.js DM sending best practices
- Database schema design patterns
- Existing bot codebase structure

