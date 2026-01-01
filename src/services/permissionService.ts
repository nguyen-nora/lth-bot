import { Guild, GuildMember, PermissionsBitField } from 'discord.js';
import { getSuperAdminId } from '../config/env.js';

/**
 * Permission tiers in hierarchical order (higher tiers have access to lower tier commands)
 */
export enum PermissionTier {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  NONE = 'NONE',
}

/**
 * Permission Service
 * Handles permission checking for bot commands based on user tiers:
 * - SUPER_ADMIN: User ID stored in .env (highest tier, access to all commands)
 * - ADMIN: Users with Administrator permission in the guild
 * - USER: Default tier for all users (lowest tier, access to user commands only)
 */
class PermissionService {
  /**
   * Check if a user is the SUPER_ADMIN
   * @param userId Discord user ID to check
   * @returns true if user is SUPER_ADMIN, false otherwise
   */
  isSuperAdmin(userId: string): boolean {
    const superAdminId = getSuperAdminId();
    if (!superAdminId) {
      return false;
    }
    return userId === superAdminId;
  }

  /**
   * Check if a guild member has Administrator permission
   * @param member Guild member to check (can be null for DM context)
   * @returns true if member has Administrator permission, false otherwise
   */
  hasAdministratorPermission(member: GuildMember | null): boolean {
    if (!member) {
      return false;
    }
    return member.permissions.has(PermissionsBitField.Flags.Administrator);
  }

  /**
   * Get the permission tier for a user in a guild
   * 
   * Permission hierarchy:
   * 1. SUPER_ADMIN: Checked first (fast, synchronous env lookup)
   * 2. ADMIN: Users with Administrator permission in the guild
   * 3. USER: Default tier for all users in the guild
   * 4. NONE: No permissions (DM context or errors)
   * 
   * @param userId Discord user ID
   * @param guild Guild context (null for DM)
   * @returns Permission tier of the user
   */
  async getUserTier(userId: string, guild: Guild | null): Promise<PermissionTier> {
    // Check SUPER_ADMIN first (fast, synchronous check)
    if (this.isSuperAdmin(userId)) {
      return PermissionTier.SUPER_ADMIN;
    }

    // If no guild context (DM), user has no permissions (except SUPER_ADMIN)
    if (!guild) {
      return PermissionTier.NONE;
    }

    try {
      // Fetch guild member to check permissions
      // Note: This may fail if:
      // - User left the server
      // - Bot lacks "View Server Members" permission
      // - Member is not cached and API call fails
      const member = await guild.members.fetch(userId);
      
      // Check if member has Administrator permission
      if (this.hasAdministratorPermission(member)) {
        return PermissionTier.ADMIN;
      }

      // Default to USER tier (all users have USER tier access)
      return PermissionTier.USER;
    } catch (error) {
      // Handle various error scenarios:
      // - User not in server (member not found)
      // - Bot lacks "View Server Members" permission
      // - Discord API errors
      // Return NONE to be safe (deny access rather than allow)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Failed to fetch member ${userId} in guild ${guild.id}: ${errorMessage}`
      );
      return PermissionTier.NONE;
    }
  }

  /**
   * Check if a user has the required permission tier or higher
   * Uses hierarchical permission system: SUPER_ADMIN > ADMIN > USER > NONE
   * @param userId Discord user ID
   * @param guild Guild context (null for DM)
   * @param requiredTier Minimum required permission tier
   * @returns true if user has required tier or higher, false otherwise
   */
  async hasPermission(
    userId: string,
    guild: Guild | null,
    requiredTier: PermissionTier
  ): Promise<boolean> {
    const userTier = await this.getUserTier(userId, guild);

    // Hierarchical permission check
    switch (requiredTier) {
      case PermissionTier.SUPER_ADMIN:
        return userTier === PermissionTier.SUPER_ADMIN;
      case PermissionTier.ADMIN:
        return (
          userTier === PermissionTier.SUPER_ADMIN || userTier === PermissionTier.ADMIN
        );
      case PermissionTier.USER:
        return (
          userTier === PermissionTier.SUPER_ADMIN ||
          userTier === PermissionTier.ADMIN ||
          userTier === PermissionTier.USER
        );
      case PermissionTier.NONE:
        return true; // No permission required
      default:
        return false;
    }
  }
}

// Export singleton instance
export const permissionService = new PermissionService();

