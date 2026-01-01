# How to Create a New Database

This guide explains how to create a new database for the LHT-Bot project using Prisma and SQLite.

## Method 1: Create a Fresh Database (Recommended)

### Step 1: Set Database Path in `.env`

Create or update your `.env` file with a new database path:

```env
DATABASE_URL="file:./data/database_new.sqlite"
```

Or use a different location:
```env
DATABASE_URL="file:./prisma/data/database_new.sqlite"
```

### Step 2: Run Prisma Migrations

This will create the database file and all tables:

```bash
npm run prisma:migrate:dev
```

When prompted, give it a migration name like `init` or `fresh_start`.

This command will:
- ✅ Create the new database file if it doesn't exist
- ✅ Create all tables based on your Prisma schema
- ✅ Generate the Prisma Client

### Step 3: Verify Database Creation

Check that the database file was created:
- Look in the `data/` or `prisma/data/` directory
- You should see a new `.sqlite` file

## Method 2: Reset Existing Database

If you want to completely reset your current database:

### Step 1: Delete the Database File

Delete the existing database file:
- `data/database.sqlite` (or wherever your DATABASE_URL points)

### Step 2: Run Migrations

```bash
npm run prisma:migrate:dev
```

This will recreate the database with a fresh schema.

## Method 3: Use Prisma Studio to View Database

Open Prisma Studio to view and manage your database:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables and data
- Add/edit/delete records
- See the database structure

## Method 4: Create Database with Custom Name

### Step 1: Update `.env`

```env
DATABASE_URL="file:./data/my_custom_database.sqlite"
```

### Step 2: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 3: Push Schema to Database

```bash
npx prisma db push
```

This creates the database and tables without creating a migration (useful for development).

## Current Database Configuration

Your current setup uses:
- **Provider**: SQLite
- **Schema**: `prisma/schema.prisma`
- **Database Path**: Set in `.env` as `DATABASE_URL`

## Available Database Tables

Based on your schema, the database includes:
- `marriages` - Marriage records
- `proposals` - Marriage proposals
- `proposal_rate_limits` - Rate limiting for proposals
- `notification_channels` - Guild notification channels
- `attendances` - User attendance records

## Troubleshooting

### Database file not created?
- Check that the directory exists (e.g., `data/` folder)
- Ensure you have write permissions
- Check the `DATABASE_URL` path in `.env`

### Migration errors?
- Make sure Prisma Client is generated: `npm run prisma:generate`
- Check your schema for syntax errors: `npx prisma validate`
- Try `npx prisma db push` instead of migrations

### Want to backup before creating new database?
```bash
# Copy existing database
cp data/database.sqlite data/database_backup.sqlite
```

## Quick Commands Reference

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration and apply it
npm run prisma:migrate:dev

# Apply existing migrations (production)
npm run prisma:migrate:deploy

# Push schema changes without migration
npx prisma db push

# Open database viewer
npm run prisma:studio

# Validate schema
npx prisma validate
```

