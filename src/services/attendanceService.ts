import prisma from '../database/prisma.js';
import { translationService } from './translationService.js';

/**
 * Attendance Record Interface
 * Represents an attendance record with user and channel information
 */
export interface AttendanceRecord {
  userId: string;
  channelId: string;
  channelName: string;
  recordedAt: Date;
}

/**
 * Attendance Statistics Interface
 * Represents attendance statistics for a user
 */
export interface AttendanceStats {
  totalDays: number;
  lastAttendanceDate: Date | null;
}

/**
 * Attendance Service
 * Manages attendance data operations (create, query, aggregate)
 */
class AttendanceService {
  /**
   * Get current date in YYYY-MM-DD format (UTC)
   * @returns Date string in YYYY-MM-DD format
   */
  private getCurrentDate(): string {
    const now = new Date();
    // Get UTC date string in YYYY-MM-DD format
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param date Date string to validate
   * @returns True if valid format
   */
  private isValidDateFormat(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  /**
   * Validate date is not in future
   * @param date Date string to validate
   * @returns True if date is not in future
   */
  private isNotFutureDate(date: string): boolean {
    const inputDate = new Date(date + 'T00:00:00Z');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return inputDate <= today;
  }

  /**
   * Record attendance for users currently in voice channels
   * @param guildId Guild ID
   * @param voiceStates Map of user IDs to voice channel IDs
   * @returns Number of users recorded
   * @throws Error if database operation fails
   */
  public async recordAttendance(
    guildId: string,
    voiceStates: Map<string, string>
  ): Promise<number> {
    try {
      if (voiceStates.size === 0) {
        return 0;
      }

      const currentDate = this.getCurrentDate();
      const now = new Date();

      // Create attendance records for all users in voice channels
      // Multiple records per user per day are now allowed
      const attendanceData = Array.from(voiceStates.entries()).map(
        ([userId, channelId]) => ({
          userId,
          guildId,
          channelId,
          recordedAt: now,
          date: currentDate,
        })
      );

      // Try batch insert first (most efficient)
      // If it fails due to timeout, fall back to sequential individual inserts
      try {
        await prisma.attendance.createMany({
          data: attendanceData,
        });
      } catch (batchError: any) {
        // If batch insert fails (e.g., timeout), try individual inserts sequentially
        // This avoids transaction overhead which can also timeout
        if (
          batchError.message?.includes('timeout') ||
          batchError.message?.includes('timed out') ||
          batchError.message?.includes('database failed to respond') ||
          batchError.code === 'P2025' ||
          batchError.code === 'P2034'
        ) {
          console.warn('Batch insert failed, falling back to sequential individual inserts:', batchError.message);
          
          // Insert records one by one without transaction
          // This is slower but avoids transaction timeout issues
          // Use retry logic with exponential backoff for database lock/timeout errors
          let successCount = 0;
          const errors: Error[] = [];
          
          for (const data of attendanceData) {
            let retries = 3;
            let inserted = false;
            
            while (retries > 0 && !inserted) {
              try {
                await prisma.attendance.create({ data });
                successCount++;
                inserted = true;
                
                // Small delay between inserts to avoid overwhelming the database
                // Only delay if there are more records to process
                if (successCount < attendanceData.length) {
                  await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
                }
              } catch (individualError: any) {
                retries--;
                
                // Check if it's a retryable error (timeout, lock, or busy)
                const isRetryable = 
                  individualError.message?.includes('timeout') ||
                  individualError.message?.includes('timed out') ||
                  individualError.message?.includes('database failed to respond') ||
                  individualError.message?.includes('locked') ||
                  individualError.message?.includes('busy') ||
                  individualError.code === 'P2025' ||
                  individualError.code === 'P2034' ||
                  individualError.code === 'SQLITE_BUSY' ||
                  individualError.code === 'SQLITE_LOCKED';
                
                if (isRetryable && retries > 0) {
                  // Exponential backoff: 100ms, 200ms, 400ms
                  const delay = Math.pow(2, 3 - retries) * 100;
                  console.warn(
                    `Retrying insert for user ${data.userId} (${retries} retries left, waiting ${delay}ms):`,
                    individualError.message
                  );
                  await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                  // No more retries or non-retryable error
                  console.warn(`Failed to insert attendance record for user ${data.userId}:`, individualError.message);
                  errors.push(individualError);
                  
                  // Delay before next record to give database time to recover
                  await new Promise(resolve => setTimeout(resolve, 100));
                  break;
                }
              }
            }
          }
          
          // If all inserts failed, provide detailed error information
          if (successCount === 0 && errors.length > 0) {
            const lastError = errors[errors.length - 1];
            const errorSummary = `All ${attendanceData.length} attendance records failed to insert after retries. ` +
              `Last error: ${lastError.message}. ` +
              `This may indicate the database is locked by another process. ` +
              `Please check if another bot instance is running or if a database tool has the file open.`;
            
            console.error(errorSummary);
            console.error('Database path from error:', lastError.message?.includes('database.sqlite') ? 
              lastError.message.match(/database\.sqlite[^"]*/)?.[0] : 'unknown');
            
            throw new Error(errorSummary);
          }
          
          // If some succeeded, log warning but continue
          if (errors.length > 0 && successCount > 0) {
            console.warn(
              `Inserted ${successCount} of ${attendanceData.length} attendance records. ${errors.length} failed.`
            );
          }
          
          // Return the count of successfully inserted records
          return successCount;
        } else {
          // Re-throw if it's not a timeout issue
          throw batchError;
        }
      }

      // Return count of newly inserted records
      return attendanceData.length;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      
      // Provide more specific error message for timeout errors
      if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out') ||
        errorMessage.includes('database failed to respond')
      ) {
        console.error('Database timeout error during attendance recording:', error);
        throw new Error(
          translationService.t('errors.failedToRecordAttendance', {
            error: 'Database timeout - please try again in a moment',
          })
        );
      }
      
      throw new Error(translationService.t('errors.failedToRecordAttendance', { error: errorMessage }));
    }
  }

  /**
   * Get attendance records for a specific date
   * @param guildId Guild ID
   * @param date Date in YYYY-MM-DD format
   * @returns Array of attendance records with user information
   * @throws Error if database query fails or invalid date
   */
  public async getAttendanceByDate(
    guildId: string,
    date: string
  ): Promise<AttendanceRecord[]> {
    try {
      // Validate date format
      if (!this.isValidDateFormat(date)) {
        throw new Error(translationService.t('errors.invalidDateFormat'));
      }

      // Validate date is not in future
      if (!this.isNotFutureDate(date)) {
        throw new Error(translationService.t('errors.futureDate'));
      }

      // Query attendance records for the date and guild
      // Return all records, including multiple records per user per day
      const records = await prisma.attendance.findMany({
        where: {
          guildId,
          date,
        },
        orderBy: {
          recordedAt: 'asc',
        },
      });

      // Map all records to AttendanceRecord format
      // Channel names will be resolved in the command
      return records.map((record) => ({
        userId: record.userId,
        channelId: record.channelId,
        channelName: record.channelId, // Will be resolved in command
        recordedAt: record.recordedAt,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (
        errorMessage.includes('Invalid date format') ||
        errorMessage.includes('future date')
      ) {
        throw error; // Re-throw validation errors
      }
      throw new Error(translationService.t('errors.failedToFetchAttendance', { error: errorMessage }));
    }
  }

  /**
   * Get attendance statistics for a user
   * @param userId User ID
   * @param guildId Guild ID
   * @returns Attendance statistics
   * @throws Error if database query fails
   */
  public async getUserAttendanceStats(
    userId: string,
    guildId: string
  ): Promise<AttendanceStats> {
    try {
      // Count distinct dates for user in guild
      const distinctDates = await prisma.attendance.findMany({
        where: {
          userId,
          guildId,
        },
        select: {
          date: true,
        },
        distinct: ['date'],
      });

      const totalDays = distinctDates.length;

      // Get most recent attendance date
      const lastRecord = await prisma.attendance.findFirst({
        where: {
          userId,
          guildId,
        },
        orderBy: {
          recordedAt: 'desc',
        },
        select: {
          recordedAt: true,
        },
      });

      const lastAttendanceDate = lastRecord?.recordedAt || null;

      return {
        totalDays,
        lastAttendanceDate,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translationService.t('common.unknownError');
      throw new Error(
        translationService.t('errors.failedToFetchStats', { error: errorMessage })
      );
    }
  }
}

// Export singleton instance
export const attendanceService = new AttendanceService();

