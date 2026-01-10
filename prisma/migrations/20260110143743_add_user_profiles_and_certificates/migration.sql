-- CreateTable
CREATE TABLE "marriage_certificates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marriage_id" INTEGER NOT NULL,
    "user1_message" TEXT,
    "user2_message" TEXT,
    "certificate_image_path" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "marriage_certificates_marriage_id_fkey" FOREIGN KEY ("marriage_id") REFERENCES "marriages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "relationship_status" TEXT NOT NULL DEFAULT 'single',
    "status_image_path" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "marriage_certificates_marriage_id_key" ON "marriage_certificates"("marriage_id");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_guild_id_idx" ON "user_profiles"("user_id", "guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_guild_id_key" ON "user_profiles"("user_id", "guild_id");
