-- CreateTable
CREATE TABLE "marriages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "married_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proposer_id" TEXT NOT NULL,
    "proposed_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "proposed_accepted" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "button_expires_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "proposal_rate_limits" (
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "last_proposal_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id", "guild_id")
);

-- CreateTable
CREATE TABLE "notification_channels" (
    "guild_id" TEXT NOT NULL PRIMARY KEY,
    "channel_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "marriages_user1_id_guild_id_idx" ON "marriages"("user1_id", "guild_id");

-- CreateIndex
CREATE INDEX "marriages_user2_id_guild_id_idx" ON "marriages"("user2_id", "guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "marriages_user1_id_user2_id_guild_id_key" ON "marriages"("user1_id", "user2_id", "guild_id");

-- CreateIndex
CREATE INDEX "proposals_proposer_id_guild_id_status_idx" ON "proposals"("proposer_id", "guild_id", "status");

-- CreateIndex
CREATE INDEX "proposals_proposed_id_guild_id_status_idx" ON "proposals"("proposed_id", "guild_id", "status");

-- CreateIndex
CREATE INDEX "proposals_status_created_at_idx" ON "proposals"("status", "created_at");
