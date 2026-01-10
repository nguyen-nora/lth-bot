-- CreateTable
CREATE TABLE "love_streaks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marriage_id" INTEGER NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "total_days" INTEGER NOT NULL DEFAULT 0,
    "user1_completed_today" BOOLEAN NOT NULL DEFAULT false,
    "user2_completed_today" BOOLEAN NOT NULL DEFAULT false,
    "last_completed_date" TEXT,
    "recoveries_used_this_month" INTEGER NOT NULL DEFAULT 0,
    "last_recovery_reset_date" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "love_streaks_marriage_id_fkey" FOREIGN KEY ("marriage_id") REFERENCES "marriages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "love_streaks_marriage_id_key" ON "love_streaks"("marriage_id");

-- CreateIndex
CREATE INDEX "love_streaks_marriage_id_idx" ON "love_streaks"("marriage_id");

-- CreateIndex
CREATE INDEX "love_streaks_last_completed_date_idx" ON "love_streaks"("last_completed_date");
