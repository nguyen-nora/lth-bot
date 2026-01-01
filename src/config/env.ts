import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates that required environment variables are present
 * @throws {Error} If required environment variables are missing
 */
export function validateEnv(): void {
  const requiredVars = ['DISCORD_TOKEN'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate token format (basic check - Discord tokens start with specific prefixes)
  const token = process.env.DISCORD_TOKEN!;
  if (!token.match(/^[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/)) {
    console.warn(
      'Warning: DISCORD_TOKEN format appears invalid. ' +
      'Discord bot tokens should match the pattern: M... or N...'
    );
  }
}

/**
 * Get the Discord bot token from environment variables
 * @returns The Discord bot token
 * @throws {Error} If token is not set
 */
export function getDiscordToken(): string {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error('DISCORD_TOKEN is not set in environment variables');
  }
  return token;
}

/**
 * Get the Discord guild ID from environment variables (optional)
 * Used for fast guild-specific command registration during development
 * @returns The Discord guild ID or null if not set
 */
export function getGuildId(): string | null {
  return process.env.GUILD_ID || null;
}

/**
 * Check if rate limiting is enabled
 * @returns true if rate limiting is enabled, false if disabled
 * Defaults to true if RATE_LIMIT is not set
 */
export function isRateLimitEnabled(): boolean {
  const rateLimit = process.env.RATE_LIMIT;
  if (rateLimit === undefined || rateLimit === null) {
    return true; // Default to enabled
  }
  // Check for various "false" representations
  const lowerRateLimit = rateLimit.toLowerCase().trim();
  return !(lowerRateLimit === 'false' || lowerRateLimit === '0' || lowerRateLimit === 'no' || lowerRateLimit === 'off');
}

/**
 * Get the SUPER_ADMIN user ID from environment variables
 * @returns The Discord user ID of the super admin, or null if not set
 */
export function getSuperAdminId(): string | null {
  const superAdminId = process.env.SUPER_ADMIN;
  if (!superAdminId || superAdminId.trim() === '') {
    return null;
  }
  return superAdminId.trim();
}

// Validate environment on module load
validateEnv();

