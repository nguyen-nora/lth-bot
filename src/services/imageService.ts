import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { Attachment } from 'discord.js';
import { translationService } from './translationService.js';

/**
 * Image configuration constants
 */
const IMAGE_CONFIG = {
  MAX_SIZE_BYTES: 8 * 1024 * 1024, // 8MB
  TARGET_SIZE: 480, // 480x480 pixels
  QUALITY: 90,
  VALID_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  STORAGE_PATH: process.env.IMAGE_STORAGE_PATH || './data/images',
};

/**
 * Image Service
 * Handles image validation, processing, and storage
 */
class ImageService {
  /**
   * Validate file path to prevent directory traversal attacks
   * @param relativePath Path to validate
   * @throws Error if path is invalid
   */
  private validatePath(relativePath: string): void {
    // Normalize the path to resolve any .. or . segments
    const normalized = path.normalize(relativePath);
    
    // Check for directory traversal attempts
    if (normalized.startsWith('..') || normalized.includes('..')) {
      throw new Error('Invalid file path: directory traversal not allowed');
    }
    
    // Check for absolute paths
    if (path.isAbsolute(normalized)) {
      throw new Error('Invalid file path: absolute paths not allowed');
    }
    
    // Check for null bytes (common injection attack)
    if (relativePath.includes('\0')) {
      throw new Error('Invalid file path: null bytes not allowed');
    }
  }

  /**
   * Validate an image attachment
   * @param attachment Discord attachment to validate
   * @returns true if valid
   * @throws Error if invalid
   */
  public validateImage(attachment: Attachment): boolean {
    // Check content type
    const contentType = attachment.contentType || '';
    if (!IMAGE_CONFIG.VALID_TYPES.includes(contentType)) {
      throw new Error(
        translationService.t('errors.invalidImageFormat', {
          formats: 'JPG, PNG, GIF, WebP',
        })
      );
    }

    // Check file size
    if (attachment.size > IMAGE_CONFIG.MAX_SIZE_BYTES) {
      throw new Error(
        translationService.t('errors.imageTooLarge', {
          maxSize: '8MB',
        })
      );
    }

    return true;
  }

  /**
   * Crop image buffer to square
   * @param buffer Image buffer
   * @param size Target size in pixels
   * @returns Processed image buffer
   */
  public async cropToSquare(buffer: Buffer, size: number = IMAGE_CONFIG.TARGET_SIZE): Promise<Buffer> {
    try {
      const processed = await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: IMAGE_CONFIG.QUALITY })
        .toBuffer();

      return processed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.imageProcessingFailed', { error: errorMessage })
      );
    }
  }

  /**
   * Process an image attachment
   * Downloads, validates, and crops the image
   * @param attachment Discord attachment
   * @returns Processed image buffer
   */
  public async processImage(attachment: Attachment): Promise<Buffer> {
    // Validate first
    this.validateImage(attachment);

    try {
      // Download image
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process with Sharp
      const processed = await this.cropToSquare(buffer);

      return processed;
    } catch (error) {
      if (error instanceof Error && error.message.includes('errors.')) {
        throw error; // Re-throw translated errors
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.imageProcessingFailed', { error: errorMessage })
      );
    }
  }

  /**
   * Save image buffer to local storage
   * @param buffer Image buffer
   * @param subdirectory Subdirectory (e.g., 'status', 'certificates')
   * @returns File path relative to storage root
   */
  public async saveToStorage(buffer: Buffer, subdirectory: 'status' | 'certificates'): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${random}.jpg`;

      // Build full path
      const dirPath = path.join(IMAGE_CONFIG.STORAGE_PATH, subdirectory);
      const filePath = path.join(dirPath, filename);

      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });

      // Write file
      await fs.writeFile(filePath, buffer);

      // Return relative path for storage in database
      return path.join(subdirectory, filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.imageSaveFailed', { error: errorMessage })
      );
    }
  }

  /**
   * Load image from storage
   * @param relativePath Relative path from storage root
   * @returns Image buffer
   */
  public async loadFromStorage(relativePath: string): Promise<Buffer> {
    // Validate path to prevent directory traversal
    this.validatePath(relativePath);
    
    try {
      const fullPath = path.join(IMAGE_CONFIG.STORAGE_PATH, relativePath);
      const buffer = await fs.readFile(fullPath);
      return buffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        translationService.t('errors.imageLoadFailed', { error: errorMessage })
      );
    }
  }

  /**
   * Delete image from storage
   * @param relativePath Relative path from storage root
   */
  public async deleteFromStorage(relativePath: string): Promise<void> {
    // Validate path to prevent directory traversal
    this.validatePath(relativePath);
    
    try {
      const fullPath = path.join(IMAGE_CONFIG.STORAGE_PATH, relativePath);
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Failed to delete image: ${relativePath}`, error);
      }
    }
  }

  /**
   * Check if image exists in storage
   * @param relativePath Relative path from storage root
   * @returns true if exists
   */
  public async exists(relativePath: string): Promise<boolean> {
    // Validate path to prevent directory traversal
    this.validatePath(relativePath);
    
    try {
      const fullPath = path.join(IMAGE_CONFIG.STORAGE_PATH, relativePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the full path for an image
   * @param relativePath Relative path from storage root
   * @returns Full filesystem path
   */
  public getFullPath(relativePath: string): string {
    // Validate path to prevent directory traversal
    this.validatePath(relativePath);
    
    return path.join(IMAGE_CONFIG.STORAGE_PATH, relativePath);
  }
}

// Export singleton instance
export const imageService = new ImageService();
