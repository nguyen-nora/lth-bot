-- DropIndex (if exists)
DROP INDEX IF EXISTS "attendances_user_id_guild_id_date_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "attendances_user_id_guild_id_date_idx" ON "attendances"("user_id", "guild_id", "date");
