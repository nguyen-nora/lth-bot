import prisma from '../database/prisma.js';
import { translationService } from './translationService.js';
import { imageService } from './imageService.js';

/**
 * Valid relationship status options
 */
export const RELATIONSHIP_STATUSES = ['single', 'complicated', 'married', 'dating'] as const;
export type RelationshipStatus = typeof RELATIONSHIP_STATUSES[number];

/**
 * Status translations (Vietnamese)
 */
export const STATUS_TRANSLATIONS: Record<RelationshipStatus, string> = {
  single: 'Độc thân',
  complicated: 'Mập mờ',
  married: 'Đã kết hôn',
  dating: 'Đang hẹn hò',
};

/**
 * User Profile interface
 */
export interface UserProfile {
  id: number;
  userId: string;
  guildId: string;
  relationshipStatus: RelationshipStatus;
  statusImagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Full profile with related data
 */
export interface FullProfile {
  profile: UserProfile;
  marriage: {
    id: number;
    partnerId: string;
    marriedAt: Date;
  } | null;
  attendance: {
    totalDays: number;
    lastAttendanceDate: Date | null;
  } | null;
}

/**
 * Profile Service
 * Manages user profiles including relationship status and images
 */
class ProfileService {
  /**
   * Validate relationship status
   * @param status Status to validate
   * @returns true if valid
   * @throws Error if invalid
   */
  public validateStatus(status: string): status is RelationshipStatus {
    if (!RELATIONSHIP_STATUSES.includes(status as RelationshipStatus)) {
      throw new Error(
        translationService.t('errors.invalidStatus', {
          validStatuses: RELATIONSHIP_STATUSES.join(', '),
        })
      );
    }
    return true;
  }

  /**
   * Get or create user profile
   * @param userId User ID
   * @param guildId Guild ID
   * @returns User profile
   */
  public async getProfile(userId: string, guildId: string): Promise<UserProfile> {
    try {
      // Try to find existing profile
      let profile = await prisma.userProfile.findUnique({
        where: {
          userId_guildId: { userId, guildId },
        },
      });

      // Create if not exists
      if (!profile) {
        profile = await prisma.userProfile.create({
          data: {
            userId,
            guildId,
            relationshipStatus: 'single',
          },
        });
      }

      return this.mapToInterface(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.failedToGetProfile', { error: errorMessage })
      );
    }
  }

  /**
   * Set relationship status
   * @param userId User ID
   * @param guildId Guild ID
   * @param status New relationship status
   * @returns Updated profile
   */
  public async setStatus(
    userId: string,
    guildId: string,
    status: RelationshipStatus
  ): Promise<UserProfile> {
    // Validate status
    this.validateStatus(status);

    try {
      // Upsert profile with new status
      const profile = await prisma.userProfile.upsert({
        where: {
          userId_guildId: { userId, guildId },
        },
        update: {
          relationshipStatus: status,
        },
        create: {
          userId,
          guildId,
          relationshipStatus: status,
        },
      });

      return this.mapToInterface(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.failedToUpdateStatus', { error: errorMessage })
      );
    }
  }

  /**
   * Set status image
   * @param userId User ID
   * @param guildId Guild ID
   * @param imagePath Image file path (relative to storage root)
   * @returns Updated profile
   */
  public async setStatusImage(
    userId: string,
    guildId: string,
    imagePath: string | null
  ): Promise<UserProfile> {
    try {
      // Get current profile to check for existing image
      const currentProfile = await this.getProfile(userId, guildId);

      // Delete old image if exists and we're setting a new one
      if (currentProfile.statusImagePath && imagePath !== currentProfile.statusImagePath) {
        await imageService.deleteFromStorage(currentProfile.statusImagePath);
      }

      // Update profile with new image path
      const profile = await prisma.userProfile.update({
        where: {
          userId_guildId: { userId, guildId },
        },
        data: {
          statusImagePath: imagePath,
        },
      });

      return this.mapToInterface(profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.failedToUpdateImage', { error: errorMessage })
      );
    }
  }

  /**
   * Get full profile with related data
   * @param userId User ID
   * @param guildId Guild ID
   * @returns Full profile with marriage and attendance data
   */
  public async getFullProfile(userId: string, guildId: string): Promise<FullProfile> {
    try {
      // Get profile
      const profile = await this.getProfile(userId, guildId);

      // Get marriage
      const marriage = await prisma.marriage.findFirst({
        where: {
          guildId,
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      });

      // Get attendance stats
      const attendanceCount = await prisma.attendance.count({
        where: { userId, guildId },
      });

      const lastAttendance = await prisma.attendance.findFirst({
        where: { userId, guildId },
        orderBy: { recordedAt: 'desc' },
      });

      return {
        profile,
        marriage: marriage
          ? {
              id: marriage.id,
              partnerId: marriage.user1Id === userId ? marriage.user2Id : marriage.user1Id,
              marriedAt: marriage.marriedAt,
            }
          : null,
        attendance: {
          totalDays: attendanceCount,
          lastAttendanceDate: lastAttendance?.recordedAt || null,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.failedToGetProfile', { error: errorMessage })
      );
    }
  }

  /**
   * Get translated status
   * @param status Relationship status
   * @returns Vietnamese translation
   */
  public getTranslatedStatus(status: RelationshipStatus): string {
    return STATUS_TRANSLATIONS[status] || status;
  }

  /**
   * Delete user profile
   * @param userId User ID
   * @param guildId Guild ID
   */
  public async deleteProfile(userId: string, guildId: string): Promise<void> {
    try {
      // Get profile to delete image
      const profile = await prisma.userProfile.findUnique({
        where: {
          userId_guildId: { userId, guildId },
        },
      });

      if (profile) {
        // Delete image if exists
        if (profile.statusImagePath) {
          await imageService.deleteFromStorage(profile.statusImagePath);
        }

        // Delete profile
        await prisma.userProfile.delete({
          where: {
            userId_guildId: { userId, guildId },
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.failedToDeleteProfile', { error: errorMessage })
      );
    }
  }

  /**
   * Map Prisma model to interface
   */
  private mapToInterface(profile: {
    id: number;
    userId: string;
    guildId: string;
    relationshipStatus: string;
    statusImagePath: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      guildId: profile.guildId,
      relationshipStatus: profile.relationshipStatus as RelationshipStatus,
      statusImagePath: profile.statusImagePath,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();
