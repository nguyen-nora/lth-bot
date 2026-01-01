import { getTranslation } from '../utils/translations.js';

/**
 * Translation Service
 * Provides centralized Vietnamese translations with parameter substitution
 */
class TranslationService {
  /**
   * Get translation by key with optional parameter substitution
   * @param key Translation key (dot-notation, e.g., 'commands.ping.description')
   * @param params Optional parameters for substitution (e.g., { count: 5 })
   * @returns Translated string with parameters substituted, or fallback
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const translation = getTranslation(key);

    if (!translation) {
      // Fallback: return key name for development, or English fallback
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Substitute parameters in the format {paramName}
    if (params) {
      return this.substituteParams(translation, params);
    }

    return translation;
  }

  /**
   * Substitute parameters in translation string
   * @param text Translation text with {param} placeholders
   * @param params Parameters to substitute
   * @returns Text with parameters substituted
   */
  private substituteParams(
    text: string,
    params: Record<string, string | number>
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return result;
  }

  /**
   * Format date in Vietnamese style
   * @param date Date to format
   * @returns Formatted date string in Vietnamese
   */
  public formatDateVietnamese(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return this.t('status.today');
    } else if (diffDays === 1) {
      return this.t('status.yesterday');
    } else if (diffDays < 7) {
      return this.t('status.daysAgo', { days: diffDays });
    } else {
      // Absolute date format: "1 tháng 1, 2024"
      const day = date.getDate();
      const month = date.getMonth(); // 0-indexed
      const year = date.getFullYear();
      
      // Get month name from translations array
      const monthNames = [
        'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
        'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
      ];
      const monthName = monthNames[month] || `tháng ${month + 1}`;
      return `${day} ${monthName}, ${year}`;
    }
  }

  /**
   * Format pluralization for Vietnamese
   * Vietnamese doesn't have plural forms, but we may need different phrasing
   * @param count Count number
   * @param singularKey Translation key for singular form
   * @param pluralKey Translation key for plural form (optional, uses singular if not provided)
   * @returns Formatted string with count
   */
  public formatPlural(
    count: number,
    singularKey: string,
    pluralKey?: string
  ): string {
    const countStr = String(count);
    // In Vietnamese, we typically use the same word but may adjust phrasing
    // For now, use singular form for all cases
    const translation = count === 1 
      ? this.t(singularKey)
      : (pluralKey ? this.t(pluralKey) : this.t(singularKey));
    
    return `${countStr} ${translation}`;
  }
}

// Export singleton instance
export const translationService = new TranslationService();

