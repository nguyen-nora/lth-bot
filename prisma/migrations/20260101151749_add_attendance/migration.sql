-- CreateTable
CREATE TABLE "attendances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "attendances_user_id_guild_id_date_idx" ON "attendances"("user_id", "guild_id", "date");

-- CreateIndex
CREATE INDEX "attendances_guild_id_date_idx" ON "attendances"("guild_id", "date");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");
